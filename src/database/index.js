import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/back-end-crud-inicial-comp_teste', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise;

export default mongoose;
