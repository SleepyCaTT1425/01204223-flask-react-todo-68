import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import TodoItem from './TodoItem.jsx'
import { useAuth } from './context/AuthContext.jsx';

function TodoList({ apiUrl }) {
  // const TODOLIST_API_URL = 'http://localhost:5000/api/todos/';
  const TODOLIST_API_URL = apiUrl;

  const [todoList, setTodoList] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  // เพิ่มหลังส่วนที่ประกาศ useState อื่นๆ
  // const [newComments, setNewComments] = useState({});

  // ** อ่านค่าจาก context
  const { username, accessToken, logout } = useAuth();

  //   useEffect(() => {
  //     fetchTodoList();
  //   }, []);

  useEffect(() => {
    fetchTodoList();
  }, [username]);                 // *** เพิ่ม username ในรายการ

  async function fetchTodoList() {
    try {
      // const response = await fetch(TODOLIST_API_URL);
      const response = await fetch(TODOLIST_API_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Network error');
      }
      const data = await response.json();
      setTodoList(data);
    } catch (err) {
      // alert("Failed to fetch todo list from backend. Make sure the backend is running.");

      setTodoList([]);           //  *** เคลียร์รายการ
    }
  }

  async function toggleDone(id) {
    const toggle_api_url = `${TODOLIST_API_URL}${id}/toggle/`
    try {
      const response = await fetch(toggle_api_url, {
        method: 'PATCH',
      })
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodoList(todoList.map(todo => todo.id === id ? updatedTodo : todo));
      }
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  }

  async function addNewTodo() {
    try {
      const response = await fetch(TODOLIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'title': newTitle }),
      });
      if (response.ok) {
        const newTodo = await response.json();
        setTodoList([...todoList, newTodo]);
        setNewTitle("");
      }
    } catch (error) {
      console.error("Error adding new todo:", error);
    }
  }

  async function deleteTodo(id) {
    const delete_api_url = `${TODOLIST_API_URL}${id}/`
    try {
      const response = await fetch(delete_api_url, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTodoList(todoList.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  // async function addNewComment(todoId) {
  async function addNewComment(todoId, newComment) {
    try {
      const url = `${TODOLIST_API_URL}${todoId}/comments/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ 'message': newComments[todoId] || "" }),
        body: JSON.stringify({ 'message': newComment }),    // ใช้ newComment
      });
      if (response.ok) {
        // setNewComments({ ...newComments, [todoId]: "" });
        await fetchTodoList();
      }
    } catch (error) {
      console.error("Error adding new comment:", error);
    }
  }

  return (
    <>
      <h1>Todo List</h1>
      <ul>
        {todoList.map(todo => (
          // <li key={todo.id}>
          //   <span className={todo.done ? "done" : ""}>{todo.title}</span>
          //   <button onClick={() => {toggleDone(todo.id)}}>Toggle</button>
          //   <button onClick={() => {deleteTodo(todo.id)}}>❌</button>

          //   {(todo.comments) && (todo.comments.length > 0) && (
          //     <>
          //       <b>Comments:</b>
          //       <ul>
          //         {todo.comments.map(comment => (
          //           <li key={comment.id}>{comment.message}</li>
          //         ))}
          //       </ul>
          //     </>
          //   )}

          //   <div className="new-comment-forms">
          //     <input
          //       type="text"
          //       value={newComments[todo.id] || ""}
          //       onChange={(e) => {
          //         const value = e.target.value;
          //         setNewComments({ ...newComments, [todo.id]: value });
          //       }}
          //     />
          //     <button onClick={() => {addNewComment(todo.id)}}>Add Comment</button>


          //   </div>

          // </li>

          <TodoItem
            key={todo.id}
            todo={todo}
            toggleDone={toggleDone}
            deleteTodo={deleteTodo}
            addNewComment={addNewComment}
          />
        ))}
      </ul>
      New: <input type="text" value={newTitle} onChange={(e) => { setNewTitle(e.target.value) }} />
      <button onClick={() => { addNewTodo() }}>Add</button>

      <br />
      <a href="/about">About</a>

      <br />
      {username && (
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>
      )}

      <br />
      <a href="/login">Login</a>

    </>
  )
}

export default TodoList
