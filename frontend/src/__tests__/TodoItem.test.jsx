import { render, screen } from '@testing-library/react'
import { expect } from 'vitest'
import TodoItem from '../TodoItem.jsx'
import userEvent from '@testing-library/user-event'

const baseTodo = {             // ** TodoItem พื้นฐานสำหรับทดสอบ
  id: 1,
  title: 'Sample Todo',
  done: false,
  comments: [],
};

describe('TodoItem', () => {
//   it('renders with no comments correctly', () => {
//     // เดี๋ยวจะเพิ่มโค้ดตรงนี้
//   });

  it('renders with no comments correctly', () => {    
    // *** โค้ดสำหรับเทสที่เพิ่มเข้ามา
    render(
      <TodoItem todo={baseTodo} />
    );
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText('No comments')).toBeInTheDocument();
  });

  it('renders with comments correctly', () => {
    const todoWithComment = {
      ...baseTodo,
      comments: [
        {id: 1, message: 'First comment'},
        {id: 2, message: 'Another comment'},
      ]
    };
    render(
      <TodoItem todo={todoWithComment} />
    );
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    //
    // *** TODO: ให้เพิ่ม assertion ว่ามีข้อความ First comment และ Another comment บนหน้าจอ
    //
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Another comment')).toBeInTheDocument();

    expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    it('does not show no comments message when it has a comment', () => {
        const todoWithComment = {
        ...baseTodo,
        comments: [
            {id: 1, message: 'First comment'},
        ]
        };
        render(
        <TodoItem todo={todoWithComment} />
        );
        expect(screen.queryByText('No comments')).not.toBeInTheDocument();
    });

    it('makes callback to toggleDone when Toggle button is clicked', () => {
    const onToggleDone = vi.fn();
    render(
      <TodoItem 
       todo={baseTodo} 
       toggleDone={onToggleDone} />
    );
    const button = screen.getByRole('button', { name: /toggle/i });
    button.click();
    expect(onToggleDone).toHaveBeenCalledWith(baseTodo.id);
  });

  it('makes callback to deleteTodo when delete button is clicked', () => {
    const onDeleteTodo = vi.fn();

    render(
      <TodoItem 
        todo={baseTodo} 
        deleteTodo={onDeleteTodo} 
      />
    );

    const button = screen.getByRole('button', { name: /x/i });
    button.click();
    expect(onDeleteTodo).toHaveBeenCalledWith(baseTodo.id);
  });

  it('makes callback to addNewComment when a new comment is added', async () => {
    const onAddNewComment = vi.fn();
    render(
      //
      // TODO: เติม component และ prop
      //

      <TodoItem 
        todo={baseTodo} 
        addNewComment={onAddNewComment} 
      />
    );

    // พิมพ์ข้อความลงใน textbox    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'New comment');

    //
    // TODO: เติมโค้ดสำหรับเรียกให้กดปุ่มด้วย
    //
    const button = screen.getByRole('button', { name: /add comment/i });
    await userEvent.click(button);
    expect(onAddNewComment).toHaveBeenCalledWith(baseTodo.id, 'New comment');
  });
});











