// Model

var Model = {
  tasks: [
    {
      text: 'hello',
      status: 'todo',
      id: '1234'
    }, // added comma
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
    return this.tasks.filter(function(task) {
      return task.status === 'todo';
    });
  },

  getDoings: function() {
    return this.tasks.filter(function(task) {
      return task.status === 'doing';
    });
  },

  getDones: function() {
    return this.tasks.filter(function(task) { // added "task" to function
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
    this.tasks.push({
      text: text,
      status: 'todo',
      id: Date.now().toString().substr(-4)
    });
  },

  deleteTask: function(id) {
    this.tasks = this.tasks.filter(function(task) {
      return id !== task.id; // wanted to do opposit of deleting everyting but the one i wanted
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
    var source = $('#board-template').html();
    this.template = Handlebars.compile(source);
  },

  renderBoard: function() {
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
    document.querySelector('#khanban').addEventListener('dragstart', this.handleDragStart);  // fixed spelling mistake
    document.querySelector('#khanban').addEventListener('drop', this.handleDrop);
  },

  handleSubmit: function(event) {
    event.preventDefault(); // added () to function
    var value = $('#todoInput').val();
    Model.addTask(value);
    View.renderBoard();
  },

  handleDelete: function() {
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
    if (column.length > 0) { // removed () to column.legnth, not function
      var id = event.dataTransfer.getData('text');
      Model.moveTask(id, column.attr('id'));
      View.renderBoard();
    }
  },

  handleLoad: function() {
    $.ajax({
      type: 'GET',
      url: 'http:/jacobfriedmann.com:3000/todos?num=1',
      success: function(tasks) { // changed to tasks (array) from data
        tasks.forEach(function(task) { // removed data. kept as tasks the array
          Model.addTask(task.text);  // added .text what it's getting from the object
        });
        View.renderBoard();
      }
    });
  }
};

function setup() {
  View.init();
  Controller.init();
}

$(document).ready(setup);
