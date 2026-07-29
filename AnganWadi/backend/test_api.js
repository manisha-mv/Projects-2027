import axios from 'axios';

const testParentAPI = async () => {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'ravi_p',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login successful');

    const attRes = await axios.get('http://localhost:5001/api/attendance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Attendance Records:', JSON.stringify(attRes.data, null, 2));

    const childRes = await axios.get('http://localhost:5001/api/children/parent/ravi_p', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Child Record ID:', childRes.data._id);
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
};

testParentAPI();
