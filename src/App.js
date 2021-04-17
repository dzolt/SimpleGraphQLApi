const { GraphQLServer } = require("graphql-yoga");
const axios = require("axios");

const USER_API = "https://jsonplaceholder.typicode.com/users/";
const TODO_API = "https://jsonplaceholder.typicode.com/todos/";



const resolvers = {
  Query: {
    users: async () => getRestUsersList(),
    todos: async () => getTodosList(),
    user: async (parent, args, context, info) => findUserById(parent, args, context, info),
    todo: async (parent, args, context, info) => findToDoById(parent, args, context, info),
  },
  User: {
    todos: (parent, args, context, info) => {
        return getUserTodos(parent.id);
    },
  },
  ToDoItem: {
    user: (parent, args, context, info) => {
      return getTodosUser(parent.userId);
    },
  },
};

async function getUserTodos(userId) {
  const todos = await axios.get(TODO_API);
  return todos.data.filter(t => t.userId === userId);
}

async function getTodosUser(userId) {
  const users = await getRestUsersList();
  return users.find(u => u.id === userId);
}

async function getRestUsersList() {
    try {
        const users = await axios.get(USER_API);

        return users.data.map(({id, name, email, username}) => ({
          id: id,
          name: name,
          email: email,
          login : username
      }));
    } catch (e) {
        throw e;
    }
}

async function getTodosList() {
  try {
    const todos = await axios.get(TODO_API);  
    
    return todos.data;
  } catch(e) {
    throw e;
  }
}

async function findUserById(parent, args, context, info) {
    const user = await axios.get(USER_API + args.id);
    const usr = {
      id: user.data.id,
      name: user.data.name,
      email: user.data.email,
      login: user.data.username
    };
    return usr;
}

async function findToDoById(parent, args, context, info) {
  const todo = await axios.get(TODO_API + args.id);  
  return todo.data;
}


const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
});

server.start(() => console.log("Server is running on http://localhost:4000"));
