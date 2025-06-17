const mongoose = require('mongoose');
const { Types } = mongoose;
const SignupModel = require('./models/signup.model');
const LoginModel = require('./models/login.model');
const EmployeeModel = require('./models/employee.model');
const DisableDateModel = require('./models/disable.model');
const BookingModel = require('./models/booking.model');

// MongoDB connection string
const mongoURI = 'mongodb://127.0.0.1:27017/makeMyMeal'; // Update with your database URI

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await SignupModel.deleteMany({});
    await LoginModel.deleteMany({});
    await EmployeeModel.deleteMany({});
    await DisableDateModel.deleteMany({});
    await BookingModel.deleteMany({});
    console.log('Cleared existing data');

    // Insert Signup and Login data
    const signupData = [
      {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        password: "$2b$10$JkzNl74RhU4WQg.fGEWJMeeD//lxTAcPVHnwlEYBNd/vvwX3tsDa2", // bcrypt hash of "password123"
        mobile: "1234567890",
        role: "admin"
      },
      {
        firstname: "Jane",
        lastname: "Smith",
        email: "jane.smith@example.com",
        password: "$2b$10$4mqtEgiuqpaMPVEavoBYSeotDYxlPafzgcX1qLA17iCshdVZUXOXC", // bcrypt hash of "securePass456"
        mobile: "9876543210",
        role: "employee"
      }
    ];
    const signupDocs = await SignupModel.insertMany(signupData);

    const loginData = signupDocs.map((user) => ({
      email: user.email,
      password: user.password,
      isAdmin: user.role === 'admin',
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + user._id + ".signature"
    }));
    await LoginModel.insertMany(loginData);

    // Insert Employee data
    const employeeData = [
      {
        emp_name: "John Doe",
        dept_name: "IT",
        emp_code: "EMP001",
        email: "john.doe@example.com"
      },
      {
        emp_name: "Jane Smith",
        dept_name: "HR",
        emp_code: "EMP002",
        email: "jane.smith@example.com"
      }
    ];
    const employeeDocs = await EmployeeModel.insertMany(employeeData);

    // Insert Disable Dates data
    const disableDatesData = [
      {
        Dates: {
          from: "2025-04-01",
          to: "2025-04-05"
        },
        Reason: "Maintenance",
        MealType: ["Lunch", "Dinner"]
      }
    ];
    await DisableDateModel.insertMany(disableDatesData);

    // Insert Booking data
    const bookingData = [
      {
        BookingPerson: "Employee",
        BookingCategory: "Lunch",
        isWeekend: false,
        Dates: {
          startDate: "2025-04-20",
          endDate: "2025-04-25"
        },
        MealCounts: 5,
        Notes: "Team lunch",
        Employee: employeeDocs[0]._id, // Reference to Employee
        CreatedBy: signupDocs[0]._id, // Reference to Signup (admin)
        CreatedAt: "2025-04-15T10:00:00Z"
      },
      {
        BookingPerson: "Rise",
        BookingCategory: "Dinner",
        isWeekend: true,
        Dates: {
          startDate: "2025-05-01",
          endDate: "2025-05-05"
        },
        MealCounts: 10,
        Notes: "Company event",
        Employee: employeeDocs[1]._id, // Reference to Employee
        CreatedBy: signupDocs[1]._id, // Reference to Signup (employee)
        CreatedAt: "2025-04-20T12:00:00Z"
      }
    ];
    await BookingModel.insertMany(bookingData);

    console.log('Seeded database successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seed function
seedDatabase();