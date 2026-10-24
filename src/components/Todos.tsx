import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Todo {
  id: number | string;
  name: string;
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select();

      if (todos) {
        setTodos(todos as Todo[]);
      }
    }

    getTodos();
  }, []);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}
