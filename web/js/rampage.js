var Rampage = {};
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
    this.ladders[0].building = this;

    this.ladders[1] = this.rampageGame.game.add.sprite(this.sprite.right - this.LADDER_WIDTH,
                                                       this.sprite.y - this.ROOF_HEIGHT - 1,
                                                       'building');
    this.ladders[1].width = this.LADDER_WIDTH;
    this.ladders[1].height = this.sprite.height;
    game.physics.arcade.enable(this.ladders[1]);
    this.ladders[1].body.immovable = true;
    this.ladders[1].climbSide = 'right';
    this.ladders[1].building = this;
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
Rampage.Bullet = function (game, source, target) {
  this.hitPoints = 1;
  this.sprite = game.add.sprite(source.x, source.y, 'bullet');

  game.physics.arcade.enable(this.sprite);
  this.sprite.body.velocity.x =  (target.x - source.x);
  this.sprite.body.velocity.y =  (target.y - source.y);


};
Rampage.Bullet.prototype = {
  sprite: null,
  hitPoints: null,
  update: function(rampageGame, game, players) {
    for (var i = 0; i < players.length; i++) {
      game.physics.arcade.overlap(this.sprite,
                                  players[i].sprite,
                                  function(player, thisSprite){
                                    players[i].onBulletHit();
                                    this.hitPoints--;
                                  },
                                  null, this);
      if(this.hitPoints <= 0) {
        rampageGame.removeBullet(this);
        this.sprite.destroy(true);
        break;
      }
    }
  }
};
Rampage.Bullet.preload = function (game) {
  game.load.image('bullet', 'assets/bullet.png', 2, 2);
};
Rampage.Player = function (rampageGame) {
  this.rampageGame = rampageGame;
  this.isFalling = false;
  this.isStriking = false;
  this.isClimbing = false;
  this.isBuildingSnapped = false;
  this.hitPoints = 10;
  this.state = 'none';
};


Rampage.Player.prototype = {
  rampageGame: null,
  sprite: null,
  playerGroup: null,
  strikePoint: null,

  state: 'none',
  isFalling: false,
  isClimbing: false,
  isStriking: false,
  isBuildingSnapped: false,


  onBulletHit: function () {
    this.hitPoints--;
  },


  jump: function () {
    this.sprite.body.velocity.y = -350;
    this.state = 'falling';
  },


  strike: function (game, buildings) {
    this.isStriking = true;
    var hitBuilding = false;
    for (var i = 0; i < buildings.length; i++) {
      game.physics.arcade.overlap(this.strikePoint, buildings[i].sprite, function (strikePoint, building) {
        hitBuilding = true;
        buildings[i].onStrike();
      }, null, this);
      if (hitBuilding) {
        break;
      }
    }
  },


  move: function (xSpeed, isRelative) {
    if (isRelative) {
      this.sprite.body.velocity.x += xSpeed;
    }
    else {
      this.sprite.body.velocity.x = xSpeed;
    }
    this.sprite.body.velocity.x = Math.min(this.sprite.body.velocity.x, 300);
    this.sprite.body.velocity.x = Math.max(this.sprite.body.velocity.x, -300);

    this.sprite.scale.x = Math.abs(xSpeed) / xSpeed;
  },


  create: function (game, x, y) {
    this.sprite = game.add.sprite(x, y, 'george');
    this.sprite.anchor.x = 0.5;
    this.sprite.animations.add('move', Rampage.Player.spritesheetMap.WALK, 10, true);
    this.sprite.animations.add('climb_up', Rampage.Player.spritesheetMap.CLIMB_UP, 10, true);
    this.sprite.animations.add('climb_down', Rampage.Player.spritesheetMap.CLIMB_DOWN, 10, true);

    game.physics.arcade.enable(this.sprite);
    this.sprite.body.gravity.y = 1000;
    this.sprite.body.collideWorldBounds = true;

    this.playerGroup = game.add.group();
    this.playerGroup.enableBody = true;
    this.strikePoint = this.playerGroup.create(x + 80, y - 80, 'star');
  },


  /**
   * @state : climbing
   * TODO : check if climbing
   * TODO : gravity disabled
   * TODO : can move up/down
   * TODO : can strike 4 ways
   * TODO : can jump "out"
   */
  climbing: function () {
    this.sprite.body.allowGravity = false;
    this.sprite.body.velocity.y = 0;

    if (this.rampageGame.cursors.up.isDown) {
      this.sprite.body.velocity.y = -300;
    }
    else if (this.rampageGame.cursors.down.isDown) {
      this.sprite.body.velocity.y = 300;
    }
    if (this.rampageGame.cursors.spacebar.isDown) {
      this.strike(this.rampageGame.game, this.rampageGame.buildings);
    }
    if (this.sprite.body.touching.down || this.getSnappableLadders().length == 0) {
      this.sprite.body.allowGravity = true;
      return this.state = 'none';
    }
    var isSnappedYet = false;
    var snappedLadders = this.getSnappableLadders();
    for (var i = 0; i < snappedLadders.length; i++) {
      if (snappedLadders[i] == this.snappedLadder) {
        isSnappedYet = true;
        break;
      }
    }
    if (!isSnappedYet) {
      this.snappedLadder = null;
      this.sprite.body.allowGravity = true;
      return this.state = 'none';
    }

    if (this.rampageGame.cursors.jump.isDown) {
      this.sprite.body.allowGravity = true;
      return this.jump();
    }
  },


  /**
   * @state : falling
   * TODO : check if falling anymore : touch ground or roof => state = "none"
   * TODO : can strike
   * TODO : can look up/down/reverse side
   * TODO : when falling, x speed is decreasing (can control x speed with inputs but less than on ground)
   * TODO : can climb : must overlap building ladder, and jump input. Control : if ladder is not behind an other building. x speed set to 0.
   **/
  falling: function () {


    if (this.sprite.body.touching.down) {
      this.state = (Math.abs(this.sprite.body.velocity.x) > 0) ? 'moving' : 'none';
      return;
    }

    if (this.rampageGame.cursors.left.isDown) {
      return this.move(-20, true);
    }
    else if (this.rampageGame.cursors.right.isDown) {
      this.move(20, true);
    }
    if (this.rampageGame.cursors.spacebar.isDown) {
      this.strike(this.rampageGame.game, this.rampageGame.buildings);
    }
    //if (this.rampageGame.cursors.jump.isDown && this.getSnappableLadders().length > 0) {
    //  this.sprite.body.velocity.y = -300;
    //  this.state = 'climbing';
    //}
  },


  /**
   * @state : moving
   * TODO : can move left/right
   * TODO : can jump
   */
  moving: function () {

    if (this.rampageGame.cursors.left.isDown) {
      this.move(-10, true);
    }
    else if (this.rampageGame.cursors.right.isDown) {
      this.move(10, true);
    }
    else if (Math.abs(this.sprite.body.velocity.x) != 0) {
      this.sprite.body.velocity.x -= 15 * (Math.abs(this.sprite.body.velocity.x) / this.sprite.body.velocity.x);
    }
    else {
      this.sprite.body.velocity.x = 0;
    }

    if (this.rampageGame.cursors.jump.isDown) {
      this.sprite.body.allowGravity = true;
      return this.jump();
    }

    if (this.rampageGame.cursors.spacebar.isDown) {
      this.strike(this.rampageGame.game, this.rampageGame.buildings);
    }

    if (Math.abs(this.sprite.body.velocity.x) < 10) {
      this.sprite.body.velocity.x = 0;
      this.state = 'none';
      return;
    }
  },


  /**
   * @state : none
   * TODO : can move left/right
   * TODO : can strike ahead/down/up
   * TODO : can jump
   * TODO : can climb : must overlap building ladder, only up if on ground, only down if on roof
   */
  none: function () {

    if (!this.sprite.body.touching.down) {
      return this.state = 'falling';
    }

    if (this.rampageGame.cursors.spacebar.isDown) {
      this.strike(this.rampageGame.game, this.rampageGame.buildings);
    }
    if (this.rampageGame.cursors.left.isDown) {
      this.move(-10, true);
      return this.state = 'moving';
    }
    if (this.rampageGame.cursors.right.isDown) {
      this.move(10, true);
      return this.state = 'moving';
    }
    if (this.rampageGame.cursors.jump.isDown) {
      this.sprite.body.allowGravity = true;
      return this.jump();

    }

    var snappableLadders = this.getSnappableLadders();
    if (this.rampageGame.cursors.up.isDown
        && snappableLadders.length > 0) {

      if (this.buildingRoofCollided) {
        for (var i = 0; i < snappableLadders.length; i++) {
          // can up ladder of other building ?
          if (this.buildingRoofCollided != snappableLadders[i].building) {
            return this.snapLadder(snappableLadders[i]);
          }
        }
      }
      else {
        return this.snapLadder(snappableLadders[0]);
      }
    }
    if (this.rampageGame.cursors.down.isDown
        && this.buildingRoofCollided
        && snappableLadders.length > 0) {
      return this.snapLadder(snappableLadders[0], true);
    }
  },


  snapLadder: function (ladder, directionBottom) {
    this.snappedLadder = ladder;
    if (this.snappedLadder.climbSide == 'left') {
      this.sprite.scale.x = 1;
      this.sprite.x = this.snappedLadder.x - 20;
    }
    else {
      this.sprite.scale.x = -1;
      this.sprite.x = this.snappedLadder.x + 40;
    }

    this.sprite.body.velocity.y = 100 * (directionBottom ? 1 : -1);
    return this.state = 'climbing';
  },


  getSnappableLadders: function () {
    var ladders = [];
    for (var i = 0; i < this.rampageGame.buildings.length; i++) {
      for (var y = 0; y < this.rampageGame.buildings[i].ladders.length; y++) {
        this.rampageGame.game.physics.arcade.overlap(this.sprite,
                                                     this.rampageGame.buildings[i].ladders[y],
                                                     function (player, ladder) {
                                                       ladders.push(ladder);
                                                     },
                                                     null,
                                                     this);
      }
    }
    return ladders;
  },


  update: function () {
    this.rampageGame.game.physics.arcade.collide(this.sprite, this.rampageGame.platforms);
    this.detectBuildingRoofCollided();
    this.rampageGame.game.debug.body(this.sprite);
    this.strikePoint.x = this.sprite.x + 35;
    this.strikePoint.y = this.sprite.y + 55;

    this.isStriking = false;
    this[this.state]();

    var frame = '';

    var actions = {
      'none': 'STAND',
      'moving': 'MOVE',
      'climbing': 'CLIMB',
      'falling': 'JUMP'
    };
    frame += actions[this.state];

    if (this.state != 'moving') {
      var lookDirection = 'SIDE';
      if (this.rampageGame.cursors.down.isDown) {
        lookDirection = 'DOWN';
      }
      else if (this.rampageGame.cursors.up.isDown) {
        lookDirection = 'UP';
      }
      frame += '_' + lookDirection;
    }
    if (this.isStriking) {
      frame += '_STRIKE';
    }
    this.frame(Rampage.Player.spritesheetMap[frame]);
    console.log(this.state, frame);
  },


  frame: function (frame) {
    if (frame == Rampage.Player.spritesheetMap.MOVE) {
      this.sprite.animations.play('move');
    }
    else if (frame == Rampage.Player.spritesheetMap.CLIMB_DOWN) {
      this.sprite.animations.play('climb_down');
    }
    else if (frame == Rampage.Player.spritesheetMap.CLIMB_UP) {
      this.sprite.animations.play('climb_up');
    }
    else {
      this.sprite.animations.stop();
      this.sprite.frame = frame;
    }
  },


  detectBuildingRoofCollided: function () {
    this.buildingRoofCollided = null;
    for (var i = 0; i < this.rampageGame.buildings.length; i++) {
      // TODO : do not collide destroyed building
      this.rampageGame.game.physics.arcade.collide(this.sprite,
                                                   this.rampageGame.buildings[i].roof,
                                                   function (sprite, roof) {
                                                     this.buildingRoofCollided = this.rampageGame.buildings[i];
                                                   }.bind(this),
                                                   function (sprite, roof) {
                                                     return sprite.body.velocity.y > 0
                                                         && (sprite.bottom < roof.bottom)
                                                         && this.state != 'climbing';
                                                   }.bind(this));
      if (this.buildingRoofCollided) {
        break;
      }
    }
  }
};

Rampage.Player.spritesheetMap = {
  STAND: 0,
  WALK: [1, 2],
  STAND_SIDE: 3,
  STAND_UP: 4,
  STAND_DOWN: 3,
  STAND_SIDE_STRIKE: 8,
  STAND_UP_STRIKE: 7,
  STAND_DOWN_STRIKE: 9,
  EAT: 10,
  JUMP_SIDE: 17,
  JUMP_UP: 19,
  JUMP_DOWN: 21,
  JUMP_OTHER_SIDE: 23,
  JUMP_SIDE_STRIKE: 18,
  JUMP_UP_STRIKE: 20,
  JUMP_DOWN_STRIKE: 22,
  JUMP_OTHER_SIDE_STRIKE: 24,
  CLIMB_SIDE: 42,
  CLIMB_UP: [39, 40],
  CLIMB_DOWN: [36, 37],
  CLIMB_SIDE_STRIKE: 34,
  CLIMB_UP_STRIKE: 38,
  CLIMB_DOWN_STRIKE: 35,
  CLIMB_REVERSE_STRIKE: 33,
  FALL_FEAR: 25,
  FALL_LONG: 26,
  MOVE: 123
};

Rampage.Player.preload = function (game) {
  game.load.spritesheet('george', 'assets/george.png', 114, 135);
  game.load.image('star', 'assets/star.png');
};
Rampage.Soldier = function () {

};
Rampage.Soldier.prototype = {
  sprite: null,
  firingDelay: 0,
  MOVE_SPEED: 100,

  fire: function(rampageGame, game, target) {
    this.firingDelay = 100;
    rampageGame.addBullet(this.sprite, target);
  },
  move: function (direction, scale) {
    this.sprite.body.velocity.x = direction;
    this.sprite.animations.play('move');
    this.sprite.scale.x = scale;
  },
  create: function (game, x, y) {
    this.sprite = game.add.sprite(x, y, 'soldier');
    this.sprite.anchor.x = 0.5;
    this.sprite.animations.add('move', Rampage.Player.spritesheetMap.WALK, 10, true);
    this.sprite.animations.add('fire', Rampage.Player.spritesheetMap.FIRE, 10, true);
    game.physics.arcade.enable(this.sprite);
    this.sprite.body.gravity.y = 100;
    this.sprite.body.collideWorldBounds = true;
  },
  update: function (rampageGame, game, platforms, players) {
    game.physics.arcade.collide(this.sprite, platforms);
    game.debug.body(this.sprite);

    this.sprite.body.velocity.x = 0;
    if (this.firingDelay> 0) {
      this.firingDelay--;
    }

    var distanceX = players[0].sprite.x - this.sprite.x;
    var distanceXAbs = Math.abs(distanceX);
    if (distanceXAbs > 100) {
      distanceX = distanceX / Math.abs(distanceX);
      this.move(this.MOVE_SPEED * distanceX, distanceX);
    }
    else if (distanceXAbs <= 100 && distanceXAbs != 0) {
      if(this.firingDelay == 0) {
        this.fire(rampageGame, game, players[0].sprite);
      }
    }


    var action = 'STAND';

    var frame = action;
    //if (this.isStriking) {
    //  frame += '_STRIKE';
    //}
    if (frame == 'STAND' && this.sprite.body.velocity.x != 0) {
      frame = 'MOVE';
    }
    this.frame(Rampage.Soldier.spritesheetMap[frame]);
  },
  frame: function (frame) {
    if (frame == Rampage.Soldier.spritesheetMap.MOVE) {
      this.sprite.animations.play('move');
    }
    else if (frame == Rampage.Soldier.FIRE) {
      this.sprite.animations.play('fire');
    }
    else {
      this.sprite.animations.stop();
      this.sprite.frame = frame;
    }
  }
};


Rampage.Soldier.preload = function (game) {
  game.load.spritesheet('soldier', 'assets/soldier.png', 32, 32);
};

Rampage.Soldier.spritesheetMap = {
  STAND: 0,
  MOVE: [1, 2],
  FIRE: [3, 4]
};
Rampage.Game = function (width, height) {
  this.players = [];
  this.soldiers = [];
  this.buildings = [];
  this.bullets = [];

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
  soldiers: null,
  players: null,
  cursors: null,

  score: 0,
  scoreText: null,

  preload: function () {
    this.game.load.image('sky', 'assets/sky.png');
    this.game.load.image('ground', 'assets/platform.png');

    Rampage.Player.preload(this.game);
    Rampage.Building.preload(this.game);
    Rampage.Soldier.preload(this.game);
    Rampage.Bullet.preload(this.game);
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
      this.addBuilding(100 + i*200, 2 + (2 - i));
    }
    for (var i = 0; i < 1; i++) {
      this.addSoldier(400 + i * 100);
    }
    this.addPlayer(200);
  },
  update: function () {
    for (var i = 0; i < this.buildings.length; i++) {
      this.buildings[i].update(this.game, this.platforms);
    }
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].update(this.game, this.cursors, this.buildings, this.platforms);
    }
    for (var i = 0; i < this.soldiers.length; i++) {
      this.soldiers[i].update(this, this.game, this.platforms, this.players);
    }
    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].update(this, this.game, this.players);
    }
  },
  addPlayer: function(x){
    var player = new Rampage.Player(this);
    player.create(this.game, x, this.game.world.height - 200);
    this.players.push(player);
  },
  addBuilding: function(x, height){
    var building = new Rampage.Building(this, 1);
    building.create(this.game, x, this.game.world.height - 64, 2, height);
    this.buildings.push(building);
  },
  addSoldier: function(x){
    var soldier = new Rampage.Soldier();
    soldier.create(this.game, x, this.game.world.height - 110);
    this.soldiers.push(soldier);
  },
  addBullet: function(source, target){
    var bullet = new Rampage.Bullet(this.game, source, target);
    //bullet.create(this.game, x, this.game.world.height - 110);
    this.bullets.push(bullet);
  },
  removeBullet: function(bullet){
    delete this.bullets.splice(this.bullets.indexOf(bullet), 1);
  }
};
