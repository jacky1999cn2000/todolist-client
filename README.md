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

* 当App加载时,从server那里load todos
   * 首先把App.js改写成一个container component(high order component, a.k.a. HoC),这样它能够在自己内部使用dispatch函数
   * 在componentDidMount里面通过`this.props.dispatch(getTodos());`来dispatch一个getTodos()的action
   * getTodos()是一个async action,返回一个即将由middleware处理的function.这个function内部可以有side effect,比如访问网络,然后等从server取回todos后再dispatch另一个叫做loadTodos()的常规action,这个action会被reducer处理,更新store.
   ```javascript
   // actions

   export const loadTodos = (todos) => {
     return {
       type: TYPES.LOAD_TODOS,
       todos
     }
   }

   export function getTodos(){
     return function(dispatch){
       return fetch('http://192.168.99.100:3000/todos/')
       .then(response => response.json())
       .then(json => {
         dispatch(loadTodos(json));
       })
       .catch(err => {
         console.log('err: ',err);
       });
     }
   }

   // reducers
   const todos = (state=List(), action) => {
     switch (action.type) {
       case 'LOAD_TODOS':
         return fromJS(action.todos);
       case 'ADD_TODO':
         return state.push(todo(undefined, action));
       case 'TOGGLE_TODO':
         return state.map(t => todo(t, action));
       default:
         return state;
     }
   }

   // App.js
   ...
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
   ```
   * [测试](http://redux.js.org/docs/recipes/WritingTests.html)
   ```javascript
   ...
   import configureMockStore from 'redux-mock-store'
   import thunk from 'redux-thunk'
   import nock from 'nock'
   const middlewares = [ thunk ]
   const mockStore = configureMockStore(middlewares)
   ...

   describe('async actions', () => {
     afterEach(() => {
       nock.cleanAll();
     });

     it('getTodos() should return a regular action LOAD_TODOS', () => {
       nock('http://192.168.99.100:3000/')
         .get('/todos/')
         .reply(200, [{"id":"1","text":"item 1","completed":false},{"id":"2","text":"item 2","completed":false}])

       const expectedAction = [
         {
           type: TYPES.LOAD_TODOS,
           todos: [{"id":"1","text":"item 1","completed":false},{"id":"2","text":"item 2","completed":false}]
         }
       ]
       const store = mockStore({ todos: [] })

       return store.dispatch(actions.getTodos())
           .then(() => { // return of async actions
             expect(store.getActions()).to.deep.equal(expectedAction)
           })
     });
   })
   ```


* 关于async call的一些资料
  * [Thunk Middleware 一个很好的解释](http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559)
  * [From Flux to Redux: Async Actions the easy way](http://danmaz74.me/2015/08/19/from-flux-to-redux-async-actions-the-easy-way/)
  * [search for 'The typical flow for retrieving data from a remote server would look like this:'](https://www.reddit.com/r/reactjs/comments/3gplr2/how_do_you_guys_fetch_data_for_a_react_app_fully/)
  * [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)

   > The statement `require('es6-promise').polyfill()` is not an import but rather a global function call intended to have global side effects. I'm pretty sure es6 module syntax did not consider this corner case worth optimizing for number of characters typed.    

### redux state 和 component state

 总体来说redux state是管理整个App都要用的data(state tree),而某个component内部可以有自己的state.

 将所有data都放在redux state里面的好处是所有的component都只是渲染而已,测试和time travel debugging就方便了许多,但这样的话redux state tree会比较复杂;

 一般情况下把那些可能好多component都会用到的data放在redux state tree里面然后通过dispatch action来改变,而在component内部用一些state来控制ui等等.当然,如果某个控制ui的state需要persistent(页面刷新后保持,见下面链接),也可以放在redux state里面然后保存在local storage里.

 redux state每次更新后,container component(High Order Component)都会更新自己的自己的子components,同时新的props会传到`componentWillReceiveProps(nextProps)`里,所以在这里可以做一些判断和处理,比如和setState()互动(见下面链接)

 * [ui state vs app state](https://www.reddit.com/r/reactjs/comments/3ogz52/using_setstate_with_redux/)
 * [local state vs global state](https://www.reddit.com/r/reactjs/comments/3mpc0e/when_using_redux_when_should_react_components_use/)
 * [what data should be put in redux state tree](http://stackoverflow.com/questions/34711477/should-you-ever-use-this-setstate-when-using-redux)
 * [how to make a React component setState() based on a Redux state change](http://stackoverflow.com/questions/35285261/how-to-make-a-react-component-setstate-based-on-a-redux-state-change)

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
