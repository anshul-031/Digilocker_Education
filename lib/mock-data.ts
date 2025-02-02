import { Person } from './types';

export const mockPerson: Person = {
  name: "John Doe",
  dateOfBirth: "1998-05-15",
  educationRecords: [
    {
      id: "1",
      type: "Secondary",
      institution: "Delhi Public School",
      board: "CBSE",
      yearOfPassing: 2014,
      percentage: 92.5,
      rollNumber: "A123456",
      certificateNumber: "CBSE/2014/123456",
      subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi"],
      status: "Completed"
    },
    {
      id: "2",
      type: "HigherSecondary",
      institution: "Delhi Public School",
      board: "CBSE",
      yearOfPassing: 2016,
      percentage: 89.8,
      rollNumber: "B123456",
      certificateNumber: "CBSE/2016/123456",
      subjects: ["English", "Physics", "Chemistry", "Mathematics", "Computer Science"],
      status: "Completed"
    },
    {
      id: "3",
      type: "Undergraduate",
      institution: "Indian Institute of Technology, Delhi",
      board: "IIT Delhi",
      yearOfPassing: 2020,
      percentage: 85.6,
      rollNumber: "2016CS10123",
      certificateNumber: "IITD/2020/BTech/123",
      subjects: ["Computer Science", "Data Structures", "Algorithms", "Machine Learning"],
      status: "Completed"
    },
    {
      id: "4",
      type: "Postgraduate",
      institution: "Indian Institute of Science, Bangalore",
      board: "IISc",
      yearOfPassing: 2024,
      percentage: 91.2,
      rollNumber: "M2022CS123",
      certificateNumber: "IISC/2024/MTech/456",
      subjects: ["Advanced Computing", "AI", "Cloud Computing"],
      status: "Ongoing"
    }
  ]
};