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
    * 还有一个好处就是[不用考虑优化问题,react会自己处理(immutable带来的好处)](http://redux.js.org/docs/basics/UsageWithReact.html)

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
### components

 * AddTodo
   * 即是普通component也是container component,它用了connect()自己渲染了自己(所以它用了let而不是const)
   ```javascript
   let AddTodo = ({ dispatch }) => {
     let input

     return (
       <div>
         <form onSubmit={e => {
           e.preventDefault()
           if(!input.value.trim()){
             return
           }
           dispatch(addTodo(input.value))
           input.value = ''
         }}>
           <input ref={node => {
             input = node
           }} />
           <button type='submit'>
             Add Todo
           </button>
         </form>
       </div>
     )
   }

   AddTodo = connect()(AddTodo)

   export default AddTodo
   ```
   * 这是AddTodo的connect()的进化史
   ```javascript
   //v1
   AddTodo = connect(
     state => {
       return {};
     },
     dispatch => {
       return { dispatch }
     }
   })(AddTodo)

   //v2
   AddTodo = connect(
     null,
     null
   })(AddTodo)

   //v3
   AddTodo = connect()(AddTodo)
   ```
 * Link
   * children是tag中间的内容
   ```javascript
   const Link = ({ active, children, onClick }) => {
     ...
   }
   ```
 * FilterLink
   * ownProps - 在container component里面,mapStateToProps和mapDispatchToProps两个函数的第二个参数可以是ownProps - 如果这个container component从自己的父component那里接受props的话
   ```javascript
   const mapStateToProps = (state, ownProps) => {
     return {
       active: ownProps.filter === state.visibilityFilter
     }
   }

   const mapDispatchToProps = (dispatch, ownProps) => {
     return {
       onClick: () => {
         dispatch(setVisibilityFilter(ownProps.filter))
       }
     }
   }
   ```
### async action & middleware

[Thunk Middleware 一个很好的解释](http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559)
[From Flux to Redux: Async Actions the easy way](http://danmaz74.me/2015/08/19/from-flux-to-redux-async-actions-the-easy-way/)
[search for 'The typical flow for retrieving data from a remote server would look like this:'](https://www.reddit.com/r/reactjs/comments/3gplr2/how_do_you_guys_fetch_data_for_a_react_app_fully/)\

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
 * 要注意语法细节
 ```javascript
   // todos is an immutable list, and each item in it is an immutable map
   return todos.filter(t => t.get('completed'))

   // todos is an array, and each item in it is a plain javascript object
   return todos.filter(t => t.completed)
 ```
 * [React ImmutablePropTypes](https://www.npmjs.com/package/react-immutable-proptypes)
 ```javascript
   TodoList.propTypes = {
     todos: ImmutablePropTypes.listOf(
       ImmutablePropTypes.contains({
         id: React.PropTypes.string.isRequired,
         text: React.PropTypes.string.isRequired,
         completed: React.PropTypes.bool.isRequired
       })
     ).isRequired,
     onTodoClick: PropTypes.func.isRequired
   }
 ```
