Rampage.Building = function (rampageGame, totalHitPoints) {
  this.totalHitPoints = totalHitPoints | 0;
  this.hitPoints = this.totalHitPoints;
  this.rampageGame = rampageGame;
  this.roof = rampageGame;
};
Rampage.Building.prototype = {
  buildingGroup: null,
  ladderLeft: null,
  ladderRight: null,
  roof: null,
  ladders: null,
  PART_HEIGHT: 64,
  PART_WIDTH: 64,
  ROOF_HEIGHT: 5,
  LADDER_WIDTH: 20,

  hitPoints: 0,
  totalHitPoints: 0,

  create: function (game, xRoot, yRoot, width, height) {

    // -- add background
    this.sprite = this.rampageGame.game.add.sprite(xRoot,
                                                   yRoot - (height * this.PART_HEIGHT),
                                                   'building');
    this.sprite.width = width * this.PART_WIDTH;
    this.sprite.height = height * this.PART_HEIGHT;
    game.physics.arcade.enable(this.sprite);

    // -- add roof
    this.roof = this.rampageGame.game.add.sprite(this.sprite.x,
                                                 this.sprite.y - this.ROOF_HEIGHT,
                                                 'building');
    this.roof.width = this.sprite.width;
    this.roof.height = this.ROOF_HEIGHT;
    game.physics.arcade.enable(this.roof);
    this.roof.body.immovable = true;

    // -- add ladders
    this.ladders = [];
    this.ladders[0] = this.rampageGame.game.add.sprite(this.sprite.x,
                                                       this.sprite.y - this.ROOF_HEIGHT - 1,
                                                       'building');
    this.ladders[0].width = this.LADDER_WIDTH;
    this.ladders[0].height = this.sprite.height;
    game.physics.arcade.enable(this.ladders[0]);
    this.ladders[0].body.immovable = true;
    this.ladders[0].climbSide = 'left';

    this.ladders[1] = this.rampageGame.game.add.sprite(this.sprite.right - this.LADDER_WIDTH,
                                                       this.sprite.y - this.ROOF_HEIGHT - 1,
                                                       'building');
    this.ladders[1].width = this.LADDER_WIDTH;
    this.ladders[1].height = this.sprite.height;
    game.physics.arcade.enable(this.ladders[1]);
    this.ladders[1].body.immovable = true;
    this.ladders[1].climbSide = 'right';
  },
  update: function (game, platforms) {
    if (this.hitPoints > 0) {
      game.physics.arcade.collide(this.sprite, platforms);
    }
  },
  onStrike: function () {
    this.hitPoints = Math.max(this.hitPoints - 1, 0);
    this.buildingGroup.tint = 0xFFFFFF * (this.hitPoints / this.totalHitPoints);
  }
};

Rampage.Building.preload = function (game) {
  game.load.spritesheet('building', 'assets/building.png', 64, 64, 3);
};