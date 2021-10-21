const pg = require('pg')
const {rowToObject, isProd} = require("./util")
const {v4: uuidV4} = require("uuid")

const pool = new pg.Pool({
  max: 10,
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? {
    rejectUnauthorized: false
} : undefined
});

async function createUser(userDTO) {
  const {displayName, email, password} = userDTO;

  const { rows: [user] } = await pool.query(`
      insert into users (id, display_name, email, password)
      values ($1, $2, $3, $4)
      returning id, display_name, email, password, created_at
    `, [uuidV4(), displayName, email, password]
  );

  return rowToObject(user);
}

async function getUserByEmail(email) {
    const { rows } = await pool.query(`
            select * from users
            where email=$1
        `, [email]
    );

    return rows.length > 0 ? rowToObject(rows[0]) : null 
}

async function getTodosByUserId(userId) {
  const {rows} = await pool.query(`
    select *
    from todos
    where user_id=$1
    order by created_at desc, task
  `, [userId])

  return rows.map(row => rowToObject(row))
}

async function getTodoById(id) {
  const {rows} = await pool.query(`
    select *
    from todos
    where id=$1
  `, [id])

  return rows.length > 0 ? rowToObject(rows[0]) : null
}

async function createTodo(userId, todoDTO) {
  const {task, description, isComplete} = todoDTO

  const { rows: [user] } = await pool.query(`
      insert into todos (id, task, description, is_complete, user_id)
      values ($1, $2, $3, $4, $5)
      returning id, task, description, is_complete, created_at, user_id
    `, [
      uuidV4(),
      task,
      description,
      isComplete,
      userId
    ]
  )

  return rowToObject(user)
}

async function updateTodo(id, todoDTO) {
  const {task, description, isComplete} = todoDTO;

  const {rows} = await pool.query(`
    update todos
    set task=$2, description=$3, is_complete=$4
    where id=$1
    returning id, task, description, is_complete, created_at, user_id
  `, [id, task, description, isComplete])

  return rows.length > 0 ? rowToObject(rows[0]) : null
}

async function deleteTodo(id) {
  await pool.query(`
    delete from todos
    where id=$1
  `, [id])

  return true
}

module.exports = {
  createUser,
  getUserByEmail,
  getTodoById,
  getTodosByUserId,
  createTodo,
  updateTodo,
  deleteTodo,
  pool
}
