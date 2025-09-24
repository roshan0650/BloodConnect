import { useEffect } from 'react';

export function SampleDataInitializer() {
  useEffect(() => {
    // Initialize sample reviews if none exist
    const existingReviews = JSON.parse(localStorage.getItem('hospitalReviews') || '[]');
    
    if (existingReviews.length === 0) {
      const sampleReviews = [
        {
          id: 1,
          patientName: "Sarah M.",
          hospitalName: "City General Hospital",
          donorName: "John D.",
          hospitalRating: 5,
          donorRating: 5,
          hospitalReview: "The hospital staff was incredibly professional and caring during my emergency. The facilities were clean and well-organized, and the medical team responded quickly to my needs. I felt safe and well-cared for throughout the entire process.",
          donorReview: "John was amazing! He responded to the emergency call within 15 minutes and was so compassionate. He stayed with me until the procedure was complete and even checked on me afterward. True hero!",
          overallExperience: "excellent",
          recommendToOthers: true,
          date: "2024-01-15T10:30:00.000Z",
          status: "active",
          submittedBy: "patient"
        },
        {
          id: 2,
          patientName: "Michael R.",
          hospitalName: "Metro Medical Center",
          donorName: "Emily S.",
          hospitalRating: 5,
          donorRating: 4,
          hospitalReview: "Outstanding medical care! The blood transfusion unit was very efficient and the nurses explained every step of the process. The hospital's coordination with the BloodConnect platform was seamless.",
          donorReview: "Emily was very responsive and professional. She arrived quickly and was well-prepared. The only minor issue was communication - would have loved more updates during the process.",
          overallExperience: "excellent",
          recommendToOthers: true,
          date: "2024-01-20T14:15:00.000Z",
          status: "active",
          submittedBy: "patient"
        },
        {
          id: 3,
          patientName: "Lisa K.",
          hospitalName: "Central Hospital",
          donorName: "David L.",
          hospitalRating: 4,
          donorRating: 5,
          hospitalReview: "Good overall experience. The hospital staff was competent and the facility was adequate. The blood transfusion went smoothly, though there was a bit of wait time initially.",
          donorReview: "David was exceptional! He was not only quick to respond but also very kind and supportive. He brought exactly what was needed and his positive attitude really helped during a stressful time.",
          overallExperience: "good",
          recommendToOthers: true,
          date: "2024-01-25T09:45:00.000Z",
          status: "active",
          submittedBy: "patient"
        },
        {
          id: 4,
          patientName: "James P.",
          hospitalName: "Regional Medical Center",
          donorName: "Anna M.",
          hospitalRating: 5,
          donorRating: 5,
          hospitalReview: "Absolutely fantastic care! The emergency team was ready when I arrived, and the blood transfusion was handled with utmost professionalism. The hospital's partnership with BloodConnect saved my life.",
          donorReview: "Anna went above and beyond! She not only donated blood but also helped coordinate with the hospital. Her quick thinking and compassionate nature made all the difference in my recovery.",
          overallExperience: "excellent",
          recommendToOthers: true,
          date: "2024-02-01T16:20:00.000Z",
          status: "active",
          submittedBy: "patient"
        },
        {
          id: 5,
          patientName: "Jennifer W.",
          hospitalName: "Community Health Center",
          donorName: "Robert K.",
          hospitalRating: 3,
          donorRating: 4,
          hospitalReview: "The medical care was adequate but the wait times were longer than expected. The staff was friendly but seemed understaffed during my visit. The blood transfusion itself was handled well.",
          donorReview: "Robert was very reliable and professional. He arrived on time and was well-prepared. The coordination between him and the hospital could have been better, but he did his part excellently.",
          overallExperience: "average",
          recommendToOthers: true,
          date: "2024-02-05T11:30:00.000Z",
          status: "active",
          submittedBy: "patient"
        },
        {
          id: 6,
          patientName: "Thomas B.",
          hospitalName: "University Hospital",
          donorName: "Maria G.",
          hospitalRating: 5,
          donorRating: 5,
          hospitalReview: "World-class medical facility with cutting-edge technology. The blood bank was extremely well-managed and the medical team was highly skilled. The entire process was smooth and efficient.",
          donorReview: "Maria is a lifesaver in every sense of the word! She responded immediately to the emergency call and was incredibly professional throughout. Her dedication to helping others is truly inspiring.",
          overallExperience: "excellent",
          recommendToOthers: true,
          date: "2024-02-10T13:45:00.000Z",
          status: "active",
          submittedBy: "patient"
        }
      ];
      
      localStorage.setItem('hospitalReviews', JSON.stringify(sampleReviews));
      
      // Trigger review count update
      window.dispatchEvent(new Event('reviewsUpdated'));
    }
  }, []);

  return null; // This component doesn't render anything
}