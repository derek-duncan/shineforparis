import path from 'path';
import views from 'co-views';

export default views(path.join(__dirname, '../views'), {
  map: {
    jade: 'jade'
  },
  default: 'jade'
});
