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


  strike: function (game, buildings, soldiers) {
    this.isStriking = true;

    /**
     * if snapped to a building, strike building
     * else (not snapped to a building) : look for a strikable object
     */
    if (this.state == 'climbing' && this.snappedLadder) {
      this.snappedLadder.getBuilding().onStrike(this.strikePoint);
    }

    /**
     *
     */
    var hasHitSomething = false;

    for (var i in buildings) {
      if (hasHitSomething) {
        break;
      }

      game.physics.arcade.overlap(
        this.strikePoint,
        buildings[i].sprite,
        function (building) {
          return function (strikePoint, buildingSprite) {
            hasHitSomething = true;
            building.onStrike(strikePoint);
          }
        }(buildings[i]));
    }

    for (var i in soldiers) {
      if (hasHitSomething) {
        break;
      }
      game.physics.arcade.overlap(
        this.strikePoint,
        soldiers[i].sprite,
        function (soldier) {
          return function (strikePoint, soldierSprite) {
            hasHitSomething = true;
            soldier.onStrike(strikePoint);
          }
        }(soldiers[i]));
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
    if (this.rampageGame.cursors.spacebar.isDown && !this.isStriking) {
      this.strike(this.rampageGame.game, this.rampageGame.buildings, this.rampageGame.soldiers);
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
      this.strike(this.rampageGame.game, this.rampageGame.buildings, this.rampageGame.soldiers);
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
      this.strike(this.rampageGame.game, this.rampageGame.buildings, this.rampageGame.soldiers);
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
      this.strike(this.rampageGame.game, this.rampageGame.buildings, this.rampageGame.soldiers);
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
      this.sprite.x = this.snappedLadder.getBuilding().sprite.left - 21;
    }
    else {
      this.sprite.scale.x = -1;
      this.sprite.x = this.snappedLadder.getBuilding().sprite.right + 21;
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


    /**
     * update strike point position
     */
    if (this.rampageGame.cursors.up.isDown) {
      this.strikePoint.x = this.sprite.x - 15;
      this.strikePoint.y = this.sprite.y + 15;
    }
    else if (this.rampageGame.cursors.down.isDown) {
      //this.strikePoint.y + = (this.sprite.height / 4);
      this.strikePoint.x = this.sprite.x + this.sprite.width / 3;
      this.strikePoint.y = this.sprite.y + this.sprite.height * 3 / 4;
    }
    else {
      this.strikePoint.x = this.sprite.x + this.sprite.width / 2;
      this.strikePoint.y = this.sprite.y + this.sprite.height / 2;
    }

    /**
     * center the strike point
     */
    this.strikePoint.x -= (this.strikePoint.width / 2);
    this.strikePoint.y -= (this.strikePoint.height / 2);

    if (this.rampageGame.cursors.spacebar.isUp) {
      this.isStriking = false;
    }

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