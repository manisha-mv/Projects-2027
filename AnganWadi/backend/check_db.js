import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/anganwadi').then(async () => {
  const children = await mongoose.connection.getClient().db().collection('children').find().toArray();
  console.log('CHILDREN:');
  console.log(JSON.stringify(children, null, 2));

  const users = await mongoose.connection.getClient().db().collection('users').find().toArray();
  console.log('USERS:');
  console.log(JSON.stringify(users, null, 2));

  process.exit(0);
});
