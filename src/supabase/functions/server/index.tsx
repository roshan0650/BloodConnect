import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify user authentication
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Health check endpoint
app.get("/make-server-90bcf304/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup endpoint
app.post("/make-server-90bcf304/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, userType, ...metadata } = body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        userType,
        ...metadata
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user profile data
    await kv.set(`user_profile:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      userType,
      ...metadata,
      createdAt: new Date().toISOString(),
      isActive: true
    });

    return c.json({ 
      message: "User created successfully",
      userId: data.user.id
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Get user profile
app.get("/make-server-90bcf304/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Create blood request (Hospital only)
app.post("/make-server-90bcf304/blood-requests", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile || profile.userType !== 'hospital') {
      return c.json({ error: 'Only hospitals can create blood requests' }, 403);
    }

    const body = await c.req.json();
    const requestId = `blood_request:${Date.now()}:${user.id}`;
    
    const bloodRequest = {
      id: requestId,
      hospitalId: user.id,
      hospitalName: profile.name,
      ...body,
      timestamp: new Date().toISOString(),
      status: 'active',
      responses: []
    };

    await kv.set(requestId, bloodRequest);
    
    // Add to hospital's requests list
    const hospitalRequests = await kv.get(`hospital_requests:${user.id}`) || [];
    hospitalRequests.unshift(requestId);
    await kv.set(`hospital_requests:${user.id}`, hospitalRequests);

    // Add to global active requests for donors to find
    const activeRequests = await kv.get('active_blood_requests') || [];
    activeRequests.unshift(requestId);
    await kv.set('active_blood_requests', activeRequests);

    return c.json({ 
      message: "Blood request created successfully",
      requestId,
      request: bloodRequest
    });
  } catch (error) {
    console.log(`Create blood request error: ${error}`);
    return c.json({ error: "Failed to create blood request" }, 500);
  }
});

// Get blood requests (Hospital gets their own, Donors get nearby compatible)
app.get("/make-server-90bcf304/blood-requests", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    let requests = [];

    if (profile.userType === 'hospital') {
      // Get hospital's own requests
      const hospitalRequestIds = await kv.get(`hospital_requests:${user.id}`) || [];
      requests = await kv.mget(hospitalRequestIds);
    } else if (profile.userType === 'donor') {
      // Get active requests compatible with donor's blood type
      const activeRequestIds = await kv.get('active_blood_requests') || [];
      const allRequests = await kv.mget(activeRequestIds);
      
      // Filter by blood type compatibility (simplified - in real app, use proper compatibility matrix)
      requests = allRequests.filter(req => 
        req && req.status === 'active' && req.bloodType === profile.bloodType
      );
    }

    return c.json(requests.filter(Boolean));
  } catch (error) {
    console.log(`Get blood requests error: ${error}`);
    return c.json({ error: "Failed to fetch blood requests" }, 500);
  }
});

// Respond to blood request (Donor only)
app.post("/make-server-90bcf304/blood-requests/:requestId/respond", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile || profile.userType !== 'donor') {
      return c.json({ error: 'Only donors can respond to blood requests' }, 403);
    }

    const requestId = c.req.param('requestId');
    const body = await c.req.json();
    
    const bloodRequest = await kv.get(requestId);
    if (!bloodRequest) {
      return c.json({ error: 'Blood request not found' }, 404);
    }

    const response = {
      id: `response:${Date.now()}:${user.id}`,
      donorId: user.id,
      donorName: profile.name,
      donorPhone: profile.phone,
      donorBloodType: profile.bloodType,
      distance: body.distance || Math.floor(Math.random() * 10) + 1, // Mock distance
      availability: body.availability || 'Available now',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    bloodRequest.responses.push(response);
    await kv.set(requestId, bloodRequest);

    return c.json({ 
      message: "Response submitted successfully",
      response
    });
  } catch (error) {
    console.log(`Respond to blood request error: ${error}`);
    return c.json({ error: "Failed to submit response" }, 500);
  }
});

// Update blood request (Hospital only)
app.put("/make-server-90bcf304/blood-requests/:requestId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile || profile.userType !== 'hospital') {
      return c.json({ error: 'Only hospitals can update blood requests' }, 403);
    }

    const requestId = c.req.param('requestId');
    const body = await c.req.json();
    
    const bloodRequest = await kv.get(requestId);
    if (!bloodRequest || bloodRequest.hospitalId !== user.id) {
      return c.json({ error: 'Blood request not found or unauthorized' }, 404);
    }

    const updatedRequest = { ...bloodRequest, ...body };
    await kv.set(requestId, updatedRequest);

    return c.json({ 
      message: "Blood request updated successfully",
      request: updatedRequest
    });
  } catch (error) {
    console.log(`Update blood request error: ${error}`);
    return c.json({ error: "Failed to update blood request" }, 500);
  }
});

// Delete blood request (Hospital only)
app.delete("/make-server-90bcf304/blood-requests/:requestId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile || profile.userType !== 'hospital') {
      return c.json({ error: 'Only hospitals can delete blood requests' }, 403);
    }

    const requestId = c.req.param('requestId');
    
    const bloodRequest = await kv.get(requestId);
    if (!bloodRequest || bloodRequest.hospitalId !== user.id) {
      return c.json({ error: 'Blood request not found or unauthorized' }, 404);
    }

    // Remove from KV store
    await kv.del(requestId);

    // Remove from hospital's requests list
    const hospitalRequests = await kv.get(`hospital_requests:${user.id}`) || [];
    const updatedRequests = hospitalRequests.filter(id => id !== requestId);
    await kv.set(`hospital_requests:${user.id}`, updatedRequests);

    // Remove from global active requests
    const activeRequests = await kv.get('active_blood_requests') || [];
    const updatedActiveRequests = activeRequests.filter(id => id !== requestId);
    await kv.set('active_blood_requests', updatedActiveRequests);

    return c.json({ message: "Blood request deleted successfully" });
  } catch (error) {
    console.log(`Delete blood request error: ${error}`);
    return c.json({ error: "Failed to delete blood request" }, 500);
  }
});

Deno.serve(app.fetch);