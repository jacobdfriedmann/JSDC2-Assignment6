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

// Bug #1 - No comma after this object
// Previous code: }
    
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

// Bug #2 - Need to define parameter 'task' in function ()
// Previous code: return this.tasks.filter(function() {

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
    this.tasks.push({
      text: text,
      status: 'todo',
      id: Date.now().toString().substr(-4)
    });
  },

  deleteTask: function(id) {
    this.tasks = this.tasks.filter(function(task) {

/*
  Bug #3 - Previous Code: return id === task.id;
  This code returns only the id that it has been passed, which
  is essentially deleting everything BUT the id it has been 
  passed, which is the id we want to delete. 

  2 ways of doing this

  #1: Replace === with !==
  This code returns everything EXCEPT the id which the function 
  has been passed, which is the one we want to delete, but does
  this actually "delete" the object or just filter the view?

  #2: Create a variable that identifies the object to delete and
  use splice to delete it:

  var deleteThis = this.tasks.filter(function(task) {
    return id === task.id;
    });
    Model.tasks.splice(deleteThis, 1);
  }

  I went with #1
*/

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
    document.querySelector('#khanban').addEventListener('dragstart', this.handleDragStart);
    document.querySelector('#khanban').addEventListener('drop', this.handleDrop);

/*
  Bug #4 - '#khanban' spelled wrong ('#kahnban')
  Previous Code: document.querySelector('#kahnban').addEventListener('drop', this.handleDrop);
    document.querySelector('#khanban').addEventListener('drop', this.handleDrop);
*/

  },


  handleSubmit: function(event) {

/*
  Bug #5 - add '()' to the end of preventDefault
  Because the function was not being called, the form was submitting and the JS was being lost at the end of execution. 
*/

    event.preventDefault();
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

/*
  Bug #6 - Uncaught TypeError: column.length is not a function
  Changed from length() to length
  Previous code: if (column.length() > 0) {
*/

    if (column.length > 0) {
      var id = event.dataTransfer.getData('text');
      Model.moveTask(id, column.attr('id'));
      View.renderBoard();
    }
  },

  handleLoad: function() {
    $.ajax({
      type: 'GET',
      url: 'http:/jacobfriedmann.com:3000/todos?num=1',
      success: function(data) {

/*
  Bug #7 and 8 - Uncaught TypeError: Cannot read property 'forEach' of undefined
  2 Problems:
  #7
  Previous code: data.tasks.forEach(function(task) {
  Change to: data.forEach(function(task) {
  Why: tasks is a key of Model, and here we just want to grab the object data 
        from the request
  #8
  Previous code: Model.addTask(task);
  Change to: Model.addTask(task.text);
  Why: task returns the entire object from the request, which has 2 keys. We
  only want the key 'text', so you have to add '.text' to 'task' in order to 
  pass that to addTask for processing.  

*/

        data.forEach(function(task) {
          Model.addTask(task.text);
        });
        View.renderBoard();
      }

    });
    function processResponse(response) {
      console.log(response);
    }
  }
};

function setup() {
  View.init();
  Controller.init();
}

$(document).ready(setup);
