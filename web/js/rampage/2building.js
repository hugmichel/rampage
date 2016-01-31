Rampage.Building = function (rampageGame, totalHitPoints) {
  this.totalHitPoints = totalHitPoints | 0;
  this.rampageGame = rampageGame;
  this.ladders = [];
};
Rampage.Building.prototype = {
  hitAreas: null,
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



    /**
     * Create layout reference sprite
     * @type {*|Phaser.TileSprite}
     */
    this.sprite = this.rampageGame.game.add.tileSprite(xRoot,
      yRoot - (height * this.PART_HEIGHT),
      width * this.PART_WIDTH,
      height * this.PART_HEIGHT,
      'hitarea');
    this.sprite.alpha = 1;


    // -- add ladders
    var getBuilding = function () {
      return this.building;
    };

    /**
     * Create left Ladder
     * @type {*|Phaser.TileSprite}
     */
    this.ladders[0] = this.rampageGame.game.add.tileSprite(0,
      0 - this.ROOF_HEIGHT - 1,
      this.LADDER_WIDTH,
      this.sprite.height + this.ROOF_HEIGHT + 1,
      'ladder');
    this.ladders[0].tileScale.y = this.ladders[0].tileScale.x = this.LADDER_WIDTH / 32;
    this.ladders[0].climbSide = 'left';
    this.ladders[0].building = this;
    this.ladders[0].getBuilding = getBuilding;

    /**
     * Create right Ladder
     * @type {*|Phaser.TileSprite}
     */
    this.ladders[1] = this.rampageGame.game.add.tileSprite(this.sprite.width - this.LADDER_WIDTH,
      0 - this.ROOF_HEIGHT - 1,
      this.LADDER_WIDTH,
      this.sprite.height + this.ROOF_HEIGHT + 1,
      'ladder');
    this.ladders[1].tileScale.y = this.ladders[1].tileScale.x = this.LADDER_WIDTH / 32;
    this.ladders[1].climbSide = 'right';
    this.ladders[1].building = this;
    this.ladders[1].getBuilding = getBuilding;

    /**
     * Create roof
     */
    this.roof = this.rampageGame.game.add.sprite(
      0, 0 - this.ROOF_HEIGHT,
      'roof');
    this.roof.width = this.sprite.width;
    this.roof.height = this.ROOF_HEIGHT;

    /**
     * Create facade
     * @type {*|Phaser.TileSprite}
     */
    this.facade = this.rampageGame.game.add.tileSprite(
      0, 0,
      width * this.PART_WIDTH,
      height * this.PART_HEIGHT,
      'facade',
      this.group);


    /**
     * add parts into group
     */
    this.sprite.addChild(this.facade);
    this.sprite.addChild(this.roof);
    this.sprite.addChild(this.ladders[0]);
    this.sprite.addChild(this.ladders[1]);

    /**
     * Enable physics
     */
    this.sprite.physicsType = Phaser.SPRITE;
    game.physics.arcade.enable(this.sprite);
    game.physics.arcade.enable(this.facade);
    game.physics.arcade.enable(this.ladders[0]);
    game.physics.arcade.enable(this.ladders[1]);
    game.physics.arcade.enable(this.roof);
    this.ladders[0].physicsType = Phaser.SPRITE;
    this.ladders[0].body.immovable = true;
    this.ladders[1].physicsType = Phaser.SPRITE;
    this.ladders[1].body.immovable = true;


    this.setHitpoints(this.totalHitPoints);


  },
  update: function (game, platforms) {

  },
  onStrike: function (strikePoint) {

    var pixels = [];
    for (var y = 0; y < 50; y++) {
      for (var x = 0; x < 50; x++) {
        pixels.push([x, y]);
      }
    }

    var temp = pixels.slice(0);

    Phaser.ArrayUtils.shuffle(temp);

    var bmd = this.rampageGame.game.make.bitmapData(50, 50);
    for (var i = 0; i < 1024; i++) {
      var xy = temp.pop();
      bmd.rect(
        0 + xy[0],
        0 + xy[1],
        1,
        1,
        'rgb(0,0,0)'
      );
    }

    var hitareaSprite = this.rampageGame.game.add.sprite(strikePoint.x - this.sprite.x, strikePoint.y - this.sprite.y, bmd);
    this.sprite.addChild(hitareaSprite);
    this.setHitpoints(Math.max(this.hitPoints - 1, 0));

  },

  setHitpoints: function (hitPoints) {
    this.hitPoints = hitPoints;
  }
};

Rampage.Building.preload = function (game) {
  game.load.image('building', 'assets/building.png');
  game.load.image('facade', 'assets/facade.png');
  game.load.image('ladder', 'assets/ladder.png');
  game.load.image('roof', 'assets/roof.png');
  game.load.image('hitarea', 'assets/hitarea.png');
};