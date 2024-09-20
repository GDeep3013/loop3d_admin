import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './custom.css';
import './admin.css';
import { Provider } from 'react-redux';
import { store } from '../store/Store';

import AppRouter from "./components/routes/AppRouter";

function App() {

  return (
    <>
      <Provider store={store}>
        <div className="App">
          <AppRouter />
        </div>
      </Provider>
    </>
  )
}

export default App
