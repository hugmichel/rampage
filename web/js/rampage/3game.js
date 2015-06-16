Rampage.Game = function (width, height) {
  this.players = [];
  this.buildings = [];

  this.game = new Phaser.Game(width, height, Phaser.AUTO, '',
                             {
                               preload: this.preload.bind(this),
                               create: this.create.bind(this),
                               update: this.update.bind(this),
                               enableDebug: true
                             });
};
Rampage.Game.prototype = {
  game: null,

  platforms: null,
  buildings: null,
  players: null,
  cursors: null,

  score: 0,
  scoreText: null,

  preload: function () {
    this.game.load.image('sky', 'assets/sky.png');
    this.game.load.image('ground', 'assets/platform.png');

    Rampage.Player.preload(this.game);
    Rampage.Building.preload(this.game);
  },

  create: function () {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.cursors.jump = this.game.input.keyboard.addKey(Phaser.Keyboard.X);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);



    // -- ground
    var skySprite = this.game.add.sprite(0, 0, 'sky');
    skySprite.width = this.game.width;
    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;
    var ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
    ground.width = this.game.width;
    ground.height = 64;
    ground.body.immovable = true;


    for(var i =0; i<3;  i++) {
      this.addBuilding(100 + i*200, 2 + i);
    }
    this.addPlayer();
  },
  update: function () {
    for (var i = 0; i < this.buildings.length; i++) {
      this.buildings[i].update(this.game, this.platforms);
    }
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].update(this.game, this.cursors, this.buildings, this.platforms);
    }
  },
  addPlayer: function(){
    var player = new Rampage.Player();
    player.create(this.game, 200, this.game.world.height - 200);
    this.players.push(player);
  },
  addBuilding: function(x, height){
    var building = new Rampage.Building(1);
    building.create(this.game, x, this.game.world.height - 64, 2, height);
    this.buildings.push(building);
  }
};
