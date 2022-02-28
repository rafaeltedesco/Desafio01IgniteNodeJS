const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const foundUser = users.find(user=> user.username === username)
  
  if (!foundUser) response.status(404).json({
    error: 'User not found'
  })
  
  request.user = foundUser
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  if (!name && !username) {
    return response.status(400).json({
      error: 'Invalid data for user'
    })
  }

  const hasUser = users.some(user=> user.username === username)
  if (hasUser) {
    return response.status(400).json({
      error: 'User already exists'
    })
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    title, deadline
  } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  request.user.todos.push(newTodo)

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const {
    title, deadline
  } = request.body
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) return response.status(404).json({
    error: 'Todo Not found'
  })
  todo.title = title
  todo.deadline = new Date(deadline)
  
  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo=> todo.id === id)

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
  
  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const userIdx = users.findIndex(user => {
    return user.username === request.user.username
  })

  const todoIdx = users[userIdx].todos.findIndex(todo=> {
    return todo.id === id
  })

  if (todoIdx === -1) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  }

  users[userIdx].todos.splice(todoIdx, 1)

  return response.status(204).json()

});

module.exports = app;