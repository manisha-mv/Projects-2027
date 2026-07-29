import Child from './models/Child.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';

export const seedDatabase = async () => {
  try {
    const childCount = await Child.countDocuments();
    const firstChild = await Child.findOne();
    const hasNextVisitDate = firstChild && firstChild.attendanceHistory && firstChild.attendanceHistory.length > 0 && firstChild.attendanceHistory[0].nextVisitDate;

    if (childCount === 21 && hasNextVisitDate) {
      console.log('Database already has the 21 dummy children with nextVisitDate. Skipping seeding.');
      return;
    }

    console.log('Clearing old data and seeding database with exactly 21 dummy records (with nextVisitDate)...');
    await Child.deleteMany({});
    await Attendance.deleteMany({});
    await User.deleteMany({ role: 'parent' });

    // Create Demo Admin if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'demo_admin',
        password: 'password123',
        role: 'admin',
        name: 'Demo Admin',
      });
      console.log('Demo admin created (username: demo_admin, password: password123)');
    }

    const today = new Date().toISOString().split('T')[0];
    const pastDate1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pastDate2 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const dummyChildren = [
      {
        name: 'Aarav Kumar', nameTa: 'ஆரவ் குமார்', age: 3, parentName: 'Ravi Kumar', parentNameTa: 'ரவி குமார்', parentUsername: 'ravi_p', height: 95, weight: 14, prevHeight: 94, prevWeight: 13.5, status: 'normal', dob: '2021-05-10', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2021-05-15', done: true }, { name: 'OPV', date: '2021-07-10', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }, { date: pastDate1, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Priya Sharma', nameTa: 'பிரியா சர்மா', age: 4, parentName: 'Amit Sharma', parentNameTa: 'அமித் சர்மா', parentUsername: 'amit_p', height: 102, weight: 13, prevHeight: 100, prevWeight: 12.8, status: 'underweight', dob: '2020-08-22', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2020-08-25', done: true }, { name: 'DPT', date: '2020-10-15', done: true }],
        attendanceHistory: [{ date: today, status: 'absent' }, { date: pastDate1, status: 'present' }],
        nutrition: 'Needs Improvement', alerts: ['Low Weight']
      },
      {
        name: 'Rohan Patel', nameTa: 'ரோஹன் படேல்', age: 2, parentName: 'Sanjay Patel', parentNameTa: 'சஞ்சய் படேல்', parentUsername: 'sanjay_p', height: 86, weight: 12, prevHeight: 84, prevWeight: 11.5, status: 'normal', dob: '2022-03-12', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2022-03-15', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Ananya Singh', nameTa: 'அனன்யா சிங்', age: 5, parentName: 'Vikram Singh', parentNameTa: 'விக்ரம் சிங்', parentUsername: 'vikram_p', height: 110, weight: 18, prevHeight: 108, prevWeight: 17.5, status: 'normal', dob: '2019-11-05', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2019-11-10', done: true }, { name: 'Measles', date: '2020-08-10', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }, { date: pastDate2, status: 'absent' }],
        nutrition: 'Excellent', alerts: []
      },
      {
        name: 'Karthik Raj', nameTa: 'கார்த்திக் ராஜ்', age: 3, parentName: 'Rajesh', parentNameTa: 'ராஜேஷ்', parentUsername: 'rajesh_p', height: 96, weight: 15, prevHeight: 95, prevWeight: 14.8, status: 'attention', dob: '2021-01-20', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2021-01-25', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Average', alerts: ['Missed OPV']
      },
      {
        name: 'Meera Reddy', nameTa: 'மீரா ரெட்டி', age: 4, parentName: 'Sunil Reddy', parentNameTa: 'சுனில் ரெட்டி', parentUsername: 'sunil_p', height: 101, weight: 16, prevHeight: 100, prevWeight: 15.5, status: 'normal', dob: '2020-04-18', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2020-04-20', done: true }, { name: 'Polio', date: '2020-06-20', done: true }],
        attendanceHistory: [{ date: today, status: 'absent' }, { date: pastDate1, status: 'absent' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Vihaan Desai', nameTa: 'விஹான் தேசாய்', age: 2, parentName: 'Manoj Desai', parentNameTa: 'மனோஜ் தேசாய்', parentUsername: 'manoj_p', height: 85, weight: 10, prevHeight: 84, prevWeight: 9.8, status: 'underweight', dob: '2022-09-14', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2022-09-18', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Poor', alerts: ['Low Weight']
      },
      {
        name: 'Diya Iyer', nameTa: 'தியா ஐயர்', age: 5, parentName: 'Kannan Iyer', parentNameTa: 'கண்ணன் ஐயர்', parentUsername: 'kannan_p', height: 108, weight: 17, prevHeight: 107, prevWeight: 16.5, status: 'normal', dob: '2019-02-28', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2019-03-05', done: true }, { name: 'Hepatitis', date: '2019-04-05', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }, { date: pastDate1, status: 'present' }],
        nutrition: 'Excellent', alerts: []
      },
      {
        name: 'Arjun Nair', nameTa: 'அர்ஜுன் நாயர்', age: 3, parentName: 'Prakash Nair', parentNameTa: 'பிரகாஷ் நாயர்', parentUsername: 'prakash_p', height: 98, weight: 15, prevHeight: 96, prevWeight: 14.5, status: 'normal', dob: '2021-07-07', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2021-07-10', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Kavya Menon', nameTa: 'காவ்யா மேனன்', age: 4, parentName: 'Hari Menon', parentNameTa: 'ஹரி மேனன்', parentUsername: 'hari_p', height: 104, weight: 16, prevHeight: 102, prevWeight: 15.5, status: 'normal', dob: '2020-12-12', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2020-12-15', done: true }, { name: 'DPT', date: '2021-02-15', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Sai Krishnan', nameTa: 'சாய் கிருஷ்ணன்', age: 2, parentName: 'Gopal', parentNameTa: 'கோபால்', parentUsername: 'gopal_p', height: 87, weight: 12, prevHeight: 85, prevWeight: 11.5, status: 'normal', dob: '2022-01-25', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2022-01-28', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }, { date: pastDate1, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Riya Pillai', nameTa: 'ரியா பிள்ளை', age: 5, parentName: 'Madhavan Pillai', parentNameTa: 'மாதவன் பிள்ளை', parentUsername: 'madhavan_p', height: 109, weight: 17, prevHeight: 108, prevWeight: 16.5, status: 'normal', dob: '2019-06-30', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2019-07-05', done: true }, { name: 'Measles', date: '2020-03-15', done: true }],
        attendanceHistory: [{ date: today, status: 'absent' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Ishaan Joshi', nameTa: 'இஷான் ஜோஷி', age: 3, parentName: 'Nitin Joshi', parentNameTa: 'நிதின் ஜோஷி', parentUsername: 'nitin_p', height: 97, weight: 15, prevHeight: 96, prevWeight: 14.5, status: 'normal', dob: '2021-08-14', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2021-08-20', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Sneha Gupta', nameTa: 'சினேகா குப்தா', age: 4, parentName: 'Ramesh Gupta', parentNameTa: 'ரமேஷ் குப்தா', parentUsername: 'ramesh_p', height: 103, weight: 14, prevHeight: 101, prevWeight: 13.5, status: 'attention', dob: '2020-05-19', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2020-05-25', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }, { date: pastDate2, status: 'absent' }],
        nutrition: 'Average', alerts: ['Missed DPT']
      },
      {
        name: 'Kabir Das', nameTa: 'கபீர் தாஸ்', age: 2, parentName: 'Anil Das', parentNameTa: 'அனில் தாஸ்', parentUsername: 'anil_p', height: 88, weight: 11, prevHeight: 86, prevWeight: 10.5, status: 'underweight', dob: '2022-11-11', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2022-11-15', done: true }],
        attendanceHistory: [{ date: today, status: 'absent' }],
        nutrition: 'Needs Improvement', alerts: ['Low Weight']
      },
      {
        name: 'Aisha Khan', nameTa: 'ஆயிஷா கான்', age: 5, parentName: 'Imran Khan', parentNameTa: 'இம்ரான் கான்', parentUsername: 'imran_p', height: 111, weight: 19, prevHeight: 110, prevWeight: 18.5, status: 'normal', dob: '2019-10-22', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2019-10-25', done: true }, { name: 'Polio', date: '2019-12-25', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Excellent', alerts: []
      },
      {
        name: 'Yash Verma', nameTa: 'யாஷ் வர்மா', age: 3, parentName: 'Vinay Verma', parentNameTa: 'வினய் வர்மா', parentUsername: 'vinay_p', height: 96, weight: 14.5, prevHeight: 95, prevWeight: 14, status: 'normal', dob: '2021-03-08', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2021-03-12', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Nitya Rao', nameTa: 'நித்யா ராவ்', age: 4, parentName: 'Suresh Rao', parentNameTa: 'சுரேஷ் ராவ்', parentUsername: 'suresh_p', height: 105, weight: 16.5, prevHeight: 104, prevWeight: 16, status: 'normal', dob: '2020-07-17', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2020-07-20', done: true }, { name: 'DPT', date: '2020-09-20', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }, { date: pastDate1, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Shaurya Bhatt', nameTa: 'சௌர்யா பட்', age: 2, parentName: 'Mahesh Bhatt', parentNameTa: 'மகேஷ் பட்', parentUsername: 'mahesh_p', height: 89, weight: 12.5, prevHeight: 88, prevWeight: 12, status: 'normal', dob: '2022-06-05', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2022-06-10', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Good', alerts: []
      },
      {
        name: 'Tara Sengupta', nameTa: 'தாரா சென்குப்தா', age: 5, parentName: 'Ravi Sengupta', parentNameTa: 'ரவி சென்குப்தா', parentUsername: 'ravi_s_p', height: 107, weight: 16.5, prevHeight: 106, prevWeight: 16, status: 'normal', dob: '2019-01-14', gender: 'Female',
        vaccinations: [{ name: 'BCG', date: '2019-01-20', done: true }, { name: 'Measles', date: '2019-10-20', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Excellent', alerts: []
      },
      {
        name: 'Devansh Tiwari', nameTa: 'தேவன்ஷ் திவாரி', age: 3, parentName: 'Ajay Tiwari', parentNameTa: 'அஜய் திவாரி', parentUsername: 'ajay_p', height: 94, weight: 13.5, prevHeight: 92, prevWeight: 13, status: 'normal', dob: '2021-09-02', gender: 'Male',
        vaccinations: [{ name: 'BCG', date: '2021-09-05', done: true }],
        attendanceHistory: [{ date: today, status: 'present' }],
        nutrition: 'Good', alerts: []
      }
    ];

    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    dummyChildren.forEach(child => {
      if (child.attendanceHistory) {
        child.attendanceHistory.forEach(record => {
          record.nextVisitDate = nextWeek;
        });
      }
    });

    const createdChildren = await Child.insertMany(dummyChildren);

    // Also populate Attendance collection for the new children
    const attendanceRecords = [];
    for (const child of createdChildren) {
      if (child.attendanceHistory && child.attendanceHistory.length > 0) {
        for (const record of child.attendanceHistory) {
          attendanceRecords.push({
            childId: child._id,
            name: child.name,
            date: record.date,
            status: record.status,
            absentCount: record.status === 'absent' ? 1 : 0,
            nextVisitDate: record.nextVisitDate
          });
        }
      }

      // Also create parent user for each child so they can login if needed
      await User.create({
        username: child.parentUsername,
        password: 'password123',
        role: 'parent',
        name: child.parentName,
        nameTa: child.parentNameTa
      });
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
    }

    console.log(`Successfully seeded ${createdChildren.length} children and their attendance records!`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
