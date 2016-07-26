// Model

var Model = {
  tasks: [
    {
      text: 'hello',
      status: 'todo',
      id: '1234'
    },
    {
      text: 'world',
      status: 'doing',
      id: '4321'
    },
    {
      text: '!!',
      status: 'done',
      id: '9999'
    }
  ],

  getTodos: function() {
    console.log('get Todos working');
    return this.tasks.filter(function(task) {
      return task.status === 'todo';
    });
  },

  getDoings: function() {
    console.log('getDoings working');
    return this.tasks.filter(function(task) {
      return task.status === 'doing';
    });
  },

  getDones: function() {
    console.log('getDones working');
    return this.tasks.filter(function(task) {
      return task.status === 'done';
    });
  },

  getAllTasks: function() {
    return {
      todos: this.getTodos(),
      doings: this.getDoings(),
      dones: this.getDones()
    };
  },

  addTask: function(text) {
    console.log('adding task');
    this.tasks.push({
      text: text,
      status: 'todo',
      id: Date.now().toString().substr(-4)
    });
  },

  deleteTask: function(id) {
    this.tasks = this.tasks.filter(function(task) {
      return id !== task.id;
    });
  },

  moveTask: function(id, status) {
    this.tasks = this.tasks.map(function(task) {
      if (task.id === id) {
        return {
          text: task.text,
          status: status,
          id: id
        };
      }
      return task;
    })
  }
};

// View

var View = {
  template: undefined,

  init: function() {
    console.log('init working');
    var source = $('#board-template').html();
    this.template = Handlebars.compile(source);
  },

  renderBoard: function() {
    console.log('renderBoard is working');
    $('#todoInput').val('');
    $('#khanban').html(this.template(Model.getAllTasks()));
  }
}

// Controller

var Controller = {
  init: function() {
    View.renderBoard();

    $('#addTaskForm').on('submit', this.handleSubmit);
    $('#load').on('click', this.handleLoad);
    $('#khanban').on('click', '.delete', this.handleDelete);
    $('#khanban').on('dragenter dragover', '.column', this.handleDrag);
    document.querySelector('#khanban').addEventListener('dragstart', this.handleDragStart);
    document.querySelector('#khanban').addEventListener('drop', this.handleDrop);
  },

  handleSubmit: function(event) {
    console.log('default prevented');
    event.preventDefault();
    var value = $('#todoInput').val();
    Model.addTask(value);
    View.renderBoard();
  },

  handleDelete: function() {
    console.log('event deleted');
    var id = $(this).parent().attr('id');
    Model.deleteTask(id);
    View.renderBoard();
  },

  handleDragStart: function(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
  },

  handleDrag: function(event) {
    event.preventDefault();
    event.stopPropagation();
  },

  handleDrop: function(event) {
    var column = $(event.target).closest('.column');
    if (column.length > 0) {
      var id = event.dataTransfer.getData('text');
      Model.moveTask(id, column.attr('id'));
      View.renderBoard();
    }
  },

  handleLoad: function() {
    console.log("ajax request");
    $.ajax({
      type: 'GET',
      url: 'jacobfriedmann.com:3000/todos?num=1',
      success: function(data) {
        data.tasks.forEach(function(task) {
          Model.addTask(task);
        });
        View.renderBoard();
      }
    });
  }
};

function setup() {
  console.log('setup working');
  View.init();
  Controller.init();
}

$(document).ready(setup);
