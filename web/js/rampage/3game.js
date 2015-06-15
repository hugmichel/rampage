Rampage.Game = function () {
  this.players = [];
  this.buildings = [];
};
Rampage.Game.prototype = {
  game: null,

  platforms: null,
  buildings: null,
  buildingsRoof: null,
  cursors: null,
  stars: null,
  score: 0,
  scoreText: null,
  _star: null,

  preload: function () {
    this.game.load.image('sky', 'assets/sky.png');
    this.game.load.image('ground', 'assets/platform.png');
    Rampage.Player.preload();

    this.game.load.image('star', 'assets/star.png');
  },
  create: function () {
    this.buildingsRoof = [];
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.cursors.jump = this.game.input.keyboard.addKey(Phaser.Keyboard.X);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.add.sprite(0, 0, 'sky');

    // -- ground
    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;
    var ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;

    this.buildings.push(new Rampage.Building());
    this.players.push(new Rampage.Player());
    for (var i = 0; i < this.buildings.length; i++) {
      this.buildings[i].create(this.game, 100, this.game.world.height - 64, 2, 5);
    }
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].create(this.game, 200, this.game.world.height - 200);
    }
  },
  update: function () {
    this.game.physics.arcade.collide(this.players[0].sprite, this.platforms);
//      this.game.physics.arcade.collide(this.buildings, this.buildings);

    for (var i = 0; i < this.buildings.length; i++) {
      this.buildings[i].update(this.game);
      this.game.physics.arcade.collide(this.buildings[i].buildingGroup, this.platforms);
    }
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].update(this.game, this.cursors, this.buildings);
    }

  }
};
