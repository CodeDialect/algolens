import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Home } from "./pages/home";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";
import { useEffect } from "react";

const App = () => {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/login" component={LoginPage} />
        <Route path="/profile" component={ProfilePage} />
      </Switch>
    </Router>
  );
};

export default App;
