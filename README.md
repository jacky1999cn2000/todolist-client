# todolist-client

这个项目主要是参照[Redux Todo List](http://redux.js.org/docs/basics/ExampleTodoList.html)做的一个针对redux的练习,但是结合了下面这些东西:

 * [Immutable JS](https://facebook.github.io/immutable-js)
 * [redux with immutable & mocha & chai & chai-immutable](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html)
 * [AWS API Gateway](another github link)

### actions

 * synchronous actions就是简单的javascript object,里面有一个必须的type attribute以及一些其他的attributes
 * 大一点儿的project可能需要把action types单独放到一个file里面去

### reducers

 * reducers是pure function(no side affect),简单说就是: (state, action) => nextState
 * 使用redux的combineReducers来简单的做reducer composition:
   * 下面这两种写法是一样的
  ```javascript
    const reducer = combineReducers({
      todos: todos,
      visibilityFilter: visibilityFilter
    })

    function reducer(state = {}, action) {
      return {
        todos: todos(state.todos, action),
        visibilityFilter: visibilityFilter(state.visibilityFilter, action)
      }
    }
 ```
   * 当`let newState = todoApp(undefined,{});`时,即state的初始化时,则state={},然后在分别调用todos(state.todos,action)和visibilityFilter(state.visibilityFilter,action),因为state.todos和state.visibilityFilter也是undefined,所以分别返回List()和‘SHOW_ALL’,最终结果就是:
     ```javascript
     {
       todos:[],
       visibilityFilter: 'SHOW_ALL'
     }
     ```
   * 代码参考
     ```javascript
     // [PROJECT-ROOT]/app/reducers/index.js
     const todoApp = combineReducers({
       todos,
       visibilityFilter
     });

     // [PROJECT-ROOT]/app/reducers/todos.js
     const todos = (state=List(), action) => {
       switch (action.type) {
         case 'ADD_TODO':
           return state.push(todo(undefined, action));
         case 'TOGGLE_TODO':
           return state.map(t => todo(t, action));
         default:
           return state;
       }
     }

     // [PROJECT-ROOT]/app/reducers/visibilityFilter.js
     const visibilityFilter = (state = 'SHOW_ALL', action) => {
       switch (action.type) {
         case 'SET_VISIBILITY_FILTER':
           return action.filter;
         default:
           return state;
       }
     }
     ```

### store & react-redux

  * 在项目根目录下面的那个index.js(启动文件)中创建一个store
  * 通过react-redux的Provider把store传到所有的components里面去
  ```javascript
  // [PROJECT-ROOT]/app/index.js
  import React from 'react';
  import { render } from 'react-dom';
  import { Provider } from 'react-redux';
  import { createStore } from 'redux';
  import todoApp from './reducers';
  import App from './components/App';
  ...

  let store = createStore(todoApp);

  render(
    <Provider store={store}>
      ...
      <App />
      ...
    </Provider>,
    document.getElementById('app')
  );
  ```
  * redux将components分为了一般的components(只负责渲染,所有的数据通过props获得),以及和store打交道的container components
  * container component[通过context得到store](https://egghead.io/lessons/javascript-redux-generating-containers-with-connect-from-react-redux-visibletodolist),在componentDidMount()里面把`()=>this.forceUpdate()`函数subscribe到store去(即每次store变化都强制刷新),并在componentWillUnmount()里面unsubscribe.
  ```javascript
    class VisibleTodoList extends Component {
      componentDidMount(){
        const { store } =  this.context;
        this.unsubscribe = store.subscribe(
          () => this.forceUpdate()
        );
      };

      componentWillUnmount(){
        this.unsubscribe();
      }

      ...
    }
  ```
  * 上述的写法太累赘,可以用[react-redux](https://github.com/reactjs/react-redux)的connect来简化(其实就是做了上述的工作):
    * mapStateToProps - 最新的state作为参数,返回值是要传递给普通component(此例中是TodoList)的data props
    * mapDispathToProps - store的dispatch函数作为参数,返回值是要传递给普通component(此例中是TodoList)的function props
    * 每一次store变化后(比如此例里面TodoList的某一个Todo被点击时调用由VisibleTodoList通过props传递下来的onTodoClick()函数,dispatch了一个toggleTodo的action,造成store变化),container component都会重新计算和刷新子components
    * 还有一个好处就是[](http://redux.js.org/docs/basics/UsageWithReact.html)

    > You could write a container component by hand, but we suggest instead generating container components with the React Redux library’s connect() function, which provides many useful optimizations to prevent unnecessary re-renders. (One result of this is that you shouldn’t have to worry about the React performance suggestion of implementing shouldComponentUpdate yourself.

    ```javascript
    // [PROJECT-ROOT]/app/containers/VisibleTodoList.js
    const mapStateToProps = (state) => {
      return {
        todos: getVisibleTodos(state.todos, state.visibilityFilter)
      }
    }

    const mapDispathToProps = (dispatch) => {
      return {
        onTodoClick: (id) => {
          dispatch(toggleTodo(id))
        }
      }
    }

    const VisibleTodoList = connect(
      mapStateToProps,
      mapDispathToProps
    )(TodoList)
    ```

### testing
 * 安装mocha,chai,chai-immutable
 * 在项目根目录里创建test文件夹
 * 创建test_helper.js,设置chai-immutable
 * 在package.json里面设置下面的命令(--compilers命令是在运行test前先用babel来transpile,--require命令是在运行test前加上test_helper.js文件,有点类似sails里面的bootstrap.test.js)
 ```javascript
 "test": "mocha --compilers js:babel-core/register --require ./test/test_helper.js --recursive",
 "test:watch": "npm run test -- --watch"
 ```

### immutable-js
[React ImmutablePropTypes](https://www.npmjs.com/package/react-immutable-proptypes)
