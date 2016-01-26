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
  LADDER_WIDTH: 16,

  hitPoints: 0,
  totalHitPoints: 0,

  create: function (game, xRoot, yRoot, width, height) {

    // -- add background
    this.sprite = this.rampageGame.game.add.tileSprite(xRoot,
                                                   yRoot - (height * this.PART_HEIGHT),
                                                   width * this.PART_WIDTH,
                                                   height * this.PART_HEIGHT,
                                                   'building');
    game.physics.arcade.enable(this.sprite);

    // -- add roof


    // -- add ladders
    this.ladders = [];
    this.ladders[0] = this.rampageGame.game.add.tileSprite(this.sprite.x,
                                                       this.sprite.y - this.ROOF_HEIGHT - 1,
                                                       this.LADDER_WIDTH,
                                                       this.sprite.height+ this.ROOF_HEIGHT + 1,
                                                       'ladder');
    game.physics.arcade.enable(this.ladders[0]);
    this.ladders[0].tileScale.y = this.ladders[0].tileScale.x = this.LADDER_WIDTH / 32;
    this.ladders[0].physicsType = Phaser.SPRITE;
    this.ladders[0].body.immovable = true;
    this.ladders[0].climbSide = 'left';
    this.ladders[0].building = this;

    this.ladders[1] = this.rampageGame.game.add.tileSprite(this.sprite.right - this.LADDER_WIDTH,
                                                       this.sprite.y - this.ROOF_HEIGHT - 1,
                                                       this.LADDER_WIDTH,
                                                       this.sprite.height + this.ROOF_HEIGHT + 1,
                                                       'ladder');
    game.physics.arcade.enable(this.ladders[1]);
    this.ladders[1].tileScale.y = this.ladders[1].tileScale.x = this.LADDER_WIDTH / 32;
    this.ladders[1].physicsType = Phaser.SPRITE;
    this.ladders[1].body.immovable = true;
    this.ladders[1].climbSide = 'right';
    this.ladders[1].building = this;


    //for(var x = 0; x<width; x++){
    //for(var y = 0; y<width; y++){
    //
    //}
    //}

    this.facade = this.rampageGame.game.add.tileSprite(xRoot,
                                                       yRoot - (height * this.PART_HEIGHT),
                                                       width * this.PART_WIDTH,
                                                       height * this.PART_HEIGHT,
                                                       'facade');
    //game.physics.arcade.enable(this.sprite);


  },
  update: function (game, platforms) {
    if (this.hitPoints > 0) {
      game.physics.arcade.collide(this.sprite, platforms);
    }
    for(var i = 0; i<this.ladders.length; i++){
      //game.debug.body(this.ladders[i]);
    }

  },
  onStrike: function () {
    this.hitPoints = Math.max(this.hitPoints - 1, 0);
    this.sprite.tint = 0xFFFFFF * (this.hitPoints / this.totalHitPoints);
  }
};

Rampage.Building.preload = function (game) {
  game.load.image('building', 'assets/building.png');
  game.load.image('facade', 'assets/facade.png');
  game.load.image('ladder', 'assets/ladder.png');
  game.load.image('roof', 'assets/roof.png');
};