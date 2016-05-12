import React from 'react'
import Footer from './Footer'
import AddTodo from '../containers/AddTodo'
import VisibleTodoList from '../containers/VisibleTodoList'
import { connect } from 'react-redux'
import { getTodos } from '../actions'


class App extends React.Component {
  constructor(){
    super(...arguments);
    this.state = {
    };
  }

  componentDidMount(){
    this.props.dispatch(getTodos());
  }

  render(){
    return (
      <div>
        <AddTodo />
        <VisibleTodoList />
        <Footer />
      </div>
    );
  }
}

App = connect()(App)

export default App
