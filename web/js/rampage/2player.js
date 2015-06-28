Rampage.Player = function (rampageGame) {
  this.rampageGame = rampageGame;
  this.isJumping = false;
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
  isJumping: false,
  isClimbing: false,
  isStriking: false,
  isBuildingSnapped: false,

  onBulletHit: function () {
    this.hitPoints--;
  },
  jump: function () {
    this.sprite.body.velocity.y = -350;
    this.state = 'jumping';
  },
  strike: function (game, buildings) {
    this.isStriking = true;
    var hitBuilding = false;
    for (var i = 0; i < buildings.length; i++) {
      game.physics.arcade.overlap(this.strikePoint, buildings[i].buildingGroup, function (strikePoint, building) {
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
    if (this.sprite.body.touching.down || this.getOverlappedBuildings().length == 0) {
      this.sprite.body.allowGravity = true;
      return this.state = 'none';
    }
    if (this.rampageGame.cursors.jump.isDown) {
      this.sprite.body.allowGravity = true;
      return this.jump();
    }
  },
  /**
   * @state : jumping
   * TODO : check if jumping anymore : touch ground or roof => state = "none"
   * TODO : can strike
   * TODO : can look up/down/reverse side
   * TODO : when jumping, x speed is decreasing (can control x speed with inputs but less than on ground)
   * TODO : can climb : must overlap building ladder, and jump input. Control : if ladder is not behind an other building. x speed set to 0.
   **/
  jumping: function () {

    if (this.isOnRoof() || this.sprite.body.touching.down) {
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
    //if (this.rampageGame.cursors.jump.isDown && this.getOverlappedBuildings().length > 0) {
    //  this.sprite.body.velocity.y = -300;
    //  this.state = 'climbing';
    //}
  },
  /**
   * @state : moving
   * TODO : check if touching roof, stopGravity
   * TODO : can move left/right
   * TODO : can jump
   */
  moving: function () {

    this.sprite.body.allowGravity = !this.isOnRoof();

    if (this.rampageGame.cursors.spacebar.isDown) {
      this.strike(this.rampageGame.game, this.rampageGame.buildings);
    }
    if (this.rampageGame.cursors.left.isDown) {
      this.move(-10, true);
    }
    else if (this.rampageGame.cursors.right.isDown) {
      this.move(10, true);
    }
    else if(Math.abs(this.sprite.body.velocity.x) != 0){
      this.sprite.body.velocity.x -= 15 * (Math.abs(this.sprite.body.velocity.x) / this.sprite.body.velocity.x);
    }
    else {
      this.sprite.body.velocity.x = 0;
    }
    if (this.rampageGame.cursors.jump.isDown) {
      this.sprite.body.allowGravity = true;
      return this.jump();
    }

    if (Math.abs(this.sprite.body.velocity.x) < 10) {
      this.sprite.body.velocity.x = 0;
      this.state = 'none';
      return;
    }
  },
  /**
   * @state : none
   * TODO : check if touching roof, stopGravity
   * TODO : can move left/right
   * TODO : can strike ahead/down/up
   * TODO : can jump
   * TODO : can climb : must overlap building ladder, only up if on ground, only down if on roof
   */
  none: function () {

    this.sprite.body.allowGravity = !this.isOnRoof();

    if (this.isOnRoof()) {
      this.sprite.body.velocity.y = 0;
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
    if (this.rampageGame.cursors.up.isDown
        && this.getOverlappedBuildings().length > 0
        && !this.isOnRoof()) {
      this.sprite.body.velocity.y = -300;
      this.state = 'climbing';
      return;
    }
    if (this.rampageGame.cursors.down.isDown && this.isOnRoof()) {
      this.sprite.body.velocity.y = 300;
      this.state = 'climbing';
      return;
    }
  },

  getOverlappedBuildings: function () {
    this.buildingSnappeds = [];
    for (var i = 0; i < this.rampageGame.buildings.length; i++) {
      this.rampageGame.game.physics.arcade.overlap(this.sprite,
                                                   this.rampageGame.buildings[i].buildingGroup,
                                                   function (player, building) {
                                                     this.buildingSnappeds.push(building);
                                                   }.bind(this),
                                                   null,
                                                   this);
    }
    return this.buildingSnappeds;
  },
  isOnRoof: function () {
    var isOnRoof = false;
    this.getOverlappedBuildings();
    if (this.buildingSnappeds.length == 2) {
      var notOnRoof = true;
      for (var i = 0; i < this.buildingSnappeds.length; i++) {
        var SpriteAboveBuildingOffset = (this.sprite.y + this.sprite.height) - this.buildingSnappeds[i].y;
        if (SpriteAboveBuildingOffset < 5) {
          notOnRoof = false;
        }
      }
      if (!notOnRoof) {
        isOnRoof = true;
      }
    }
    return isOnRoof;
  },
  update: function () {
    this.rampageGame.game.physics.arcade.collide(this.sprite, this.rampageGame.platforms);
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
      'jumping': 'JUMP'
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