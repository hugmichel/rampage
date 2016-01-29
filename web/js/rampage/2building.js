Rampage.Building = function (rampageGame, totalHitPoints) {
  this.totalHitPoints = totalHitPoints | 0;
  this.hitPoints = this.totalHitPoints;
  this.rampageGame = rampageGame;
  this.roof = rampageGame;
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

    // -- add background
    this.sprite = this.rampageGame.game.add.tileSprite(xRoot,
                                                   yRoot - (height * this.PART_HEIGHT),
                                                   width * this.PART_WIDTH,
                                                   height * this.PART_HEIGHT,
                                                   'hitarea');
    game.physics.arcade.enable(this.sprite);

    // -- add roof
    this.roof = this.rampageGame.game.add.sprite(this.sprite.x,
        this.sprite.y - this.ROOF_HEIGHT,
        'roof');
    this.roof.width = this.sprite.width;
    this.roof.height = this.ROOF_HEIGHT;
    game.physics.arcade.enable(this.roof);
    this.roof.body.immovable = true;

    // -- add ladders
    this.ladders = [];
    this.ladders[0] = this.rampageGame.game.add.tileSprite(this.sprite.x,
        this.sprite.y - this.ROOF_HEIGHT - 1,
        this.LADDER_WIDTH,
        this.sprite.height + this.ROOF_HEIGHT + 1,
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


    this.facade = this.rampageGame.game.add.tileSprite(xRoot,
        yRoot - (height * this.PART_HEIGHT),
        width * this.PART_WIDTH,
        height * this.PART_HEIGHT,
        'facade');



    // -- add hitAreas
    this.hitAreas = [];
    console.log(arguments);
    for (var x = 0; x <  width; x++) {
      for (var y = 0; y < height; y++) {
        console.log(x, y);
        var hitArea = this.rampageGame.game.add.sprite(
            xRoot + (x * this.PART_WIDTH),
            yRoot - ((height - y) * this.PART_HEIGHT),
            //this.PART_WIDTH,
            //this.PART_HEIGHT,
            'building');
        game.physics.arcade.enable(hitArea);
        hitArea.hitPoints = this.hitPoints;
        hitArea.alpha = 0;
        this.hitAreas.push(hitArea);
      }
    }

  },
  update: function (game, platforms) {
    if (this.hitPoints > 0) {
      game.physics.arcade.collide(this.sprite, platforms);
    }
    for (var i = 0; i < this.ladders.length; i++) {
      //game.debug.body(this.ladders[i]);
    }

  },
  onStrike: function (hitArea) {
    console.log('onStrike', hitArea, hitArea.hitPoints, this.totalHitPoints);
    hitArea.hitPoints = Math.max(hitArea.hitPoints - 1, 0);
    //hitArea.tint = 0xFFFFFF * (hitArea.hitPoints / this.totalHitPoints);
    hitArea.alpha = 1 - (hitArea.hitPoints / this.totalHitPoints);
  }
};

Rampage.Building.preload = function (game) {
  game.load.image('building', 'assets/building.png');
  game.load.image('facade', 'assets/facade.png');
  game.load.image('ladder', 'assets/ladder.png');
  game.load.image('roof', 'assets/roof.png');
  game.load.image('hitarea', 'assets/hitarea.png');
};