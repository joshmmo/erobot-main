//***************************************************************************//
//          CSE 423/424 Computer Systems Engineering Capstone                    //
//          Team March:                                                      //
//              Megan Plachecki                                              //
//              Kacey Richards                                               //
//              Jace Hensley                                                 //
//              Joshua Moore                                                 //
//              Austin Carr                                                  //
//                                                                           //
//          Sponsor: Professor Chen                                          //
//                                                                           //
//***************************************************************************//

/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

//THIRD PARTY LIBRARIES
//var firmata = require("firmata");
var five = require("johnny-five");
var Edison = require("edison-io");
var net = require('net');
//var SerialPort = require("serialport").SerialPort;  

//SET UP BOARD 
var board;
board = new five.Board({
    io: new Edison()
});

//SENSOR DATA STRUCTURE TO SEND TO WEB SERVICE
function SensorDataObject(){
    this.name = 'sensorName';
    this.id = 0;
    this.value = 0.0;
}

//SERVO DATA STRUCTURE TO BE PARSED AND EXECUTED
function ServoCommandObject() {
    this.servoID = 0;
    this.servoSpeed = 0.0;
    this.servoDirection = 0;   
}

//value to be updated with sensor data
var distanceSensorValCm1,
	distanceSensorValCm2;

//SET UP CONNECTION WITH WEB SERVICE
var server = net.createServer(function(c) { //'connection' listener
  console.log('Robot and Web Service are Connected!');
  c.on('end', function() {
    console.log('Disconnecting');
	drive_continuous_servo(3,0);
	drive_continuous_servo(5,0);
  });
    
	//READ SERVO COMMANDS FROM WEB SERVICE AND EXECUTE
	c.on('data', function(data) {
		
		console.log(data.toString());
		try { 
			var JSONServoData = JSON.parse(data.toString());		
			var ServoArray = JSONServoData.servos;
			
			for (var i in ServoArray) {
				var id = ServoArray[i].servoId;
				var speed = ServoArray[i].servoSpeed;
			
				drive_continuous_servo(id, speed);		
			}
		
		} catch (error) {
			console.log("Error! " + error );
			console.log("Servo Data was: " + data.toString());
		}      
	});
    
	//SEND SENSOR DATA TO WEB SERVICE	
	var sonarSensor1 = new SensorDataObject();
	var sonarSensor2 = new SensorDataObject();
	sonarSensor1.name = "distance";
	sonarSensor1.id = 0;   
	
	sonarSensor2.name = "distance";
	sonarSensor2.id = 1;   
	
	var interval = setInterval(function() {
		sonarSensor1.value = distanceSensorValCm1;
		sonarSensor2.value = distanceSensorValCm2;
		
		c.write(JSON.stringify({sensors: [sonarSensor1, sonarSensor2]}) + '\r\n');
		c.pipe(c);   
		
		},1000);
});
server.listen(8124, function() { //'listening' listener
  console.log('Starting Connection');
});


//SERVOS
//Servo Id will be the pin that the servo is connected to 
var PIN3 = 3;
var PIN5 = 5;
var PIN9 = 9;
var SERVO_3;     //left wheel in our robot
var SERVO_5;    //right wheel in our robot
var SERVO_9;   //sensor motor in our robot (NONCONTINUOUS) NOT CURRENTLY USED

//SENSORS
//possible to have two of each kind of sensor, Ids 0 and 1

//SONAR (distance)
var DISTANCE_0;
var DISTANCE_0_PIN = "A2";
var DISTANCE_1;
var DISTANCE_1_PIN = "A3";

//TOUCH (button)
var TOUCH_0;
var TOUCH_0_PIN = "D6";

//LIGHT
var LIGHT_0;
var LIGHT_0_PIN;

//Other sensors to be declared and have pins set as needed
var LIGHT_0;
var LIGHT_0_PIN;
var LIGHT_1;
var LIGHT_1_PIN;
var COLOR_0;
var COLOR_0_PIN;
var COLOR_1;
var COLOR_1_PIN;
var SOUND_0;
var SOUND_0_PIN;
var SOUND_1;
var SOUND_1_PIN;
var SERVO_ENCODER_0;
var SERVO_ENCODER_0_PIN;
var SERVO_ENCODER_1;
var SERVO_ENCODER_1_PIN;

//FUNCTION FOR DRIVING CONTINUOUS SERVOS
//user will pass an int for servoId (corresponding to pin servo is connected to on board)
//user will pass a double between 0 and 1 for servoSpeed (0=no motion aka stop, 1 = full speed)
//user will pass an ints for servoDirection (0 = clockwise or 1 = counterclockwise)
function drive_continuous_servo(servoId, servoSpeed){
	var id = Number(servoId);
	var speed = servoSpeed;
	
	switch(id) {
		case 3:
			SERVO_3.ccw(speed);
			break;
		case 5:
			SERVO_5.cw(speed);
			break;
	}  
}

//FUNCTION FOR DRIVING NONCONTINUOUS SERVO
//user will pass an int for servoId (corresponding to pin servo is connected to on board)
//currently SERVO_9 is the only uncontinuous servo (for turning distance sensor)
//user will pass in an int from 0 to 180 for angle (0 = face left and 180 = face right)
function drive_uncontinuous_servo(servoId, angle){
    
     switch(servoId){ 
        case 3:     break; //SERVO_3 is not uncontinuous
        case 5:     break; //SERVO_3 is not uncontinuous
        case 9:     
             SERVO_9.to(angle);
             break;
        default:    break; //do nothing
    }
}

//FUNCTION TO READ DATA FROM TOUCH (BUTTON) SENSOR
//user will pass in an int for sensorId (0 or 1, two possible sensors)
//returns an int (0 = button not pressed or 1 = button pressed)
function get_data_touch_sensor(sensorId){
    
    if (sensorId === 0) {
         TOUCH_0.on("down", function() {
            return 1;
          });
    }
    else if (sensorId === 1) {
        TOUCH_1.on("down", function() {
            return 1;
          });
    }
    
    return 0;
}


//MAIN FUNCTION TO DRIVE THE BOARD
board.on("ready", function() {
    //DECLARE SERVOS   
    SERVO_5 = new five.Servo({
        pin: PIN5,
        type: "continuous"
    });
    
    SERVO_3 = new five.Servo({
        pin: PIN3,
        type: "continuous"
    });
	
	//initialize speed to zero
	SERVO_5.ccw(0);
	SERVO_3.ccw(0);
	SERVO_5.cw(0);
	SERVO_3.cw(0);

	//DECLARE SENSORS
    DISTANCE_0 = new five.Sonar(DISTANCE_0_PIN);
	DISTANCE_1 = new five.Sonar(DISTANCE_1_PIN);
    TOUCH_0 = new five.Button(TOUCH_0_PIN);
    
	DISTANCE_0.on("change", function() {
			distanceSensorValCm1 = this.cm;
			//console.log("data 0 is " + this.cm);
	});
	
	DISTANCE_1.on("change", function() {
			distanceSensorValCm2 = this.cm;
			//console.log("data 1 is " + this.cm);
	});
	
	 var lcd = new five.LCD({
    controller: "JHD1313M1"
  });
  
    lcd.cursor(0, 0).print("IP:");
	lcd.cursor(1, 0).print("10.143.13.253");
});
    
    
	
	
