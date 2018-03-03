var canv = document.getElementById("myCanvas");
var context = canv.getContext("2d");
var subfunctionsNumber = 0;

function Vector2(x,y)
{
    this.x = x;
    this.y = y;
}

// a*v(b + t)
function subFunction(a,b)
{
    this.a = a;
    this.b = b;
    this.getValue = function(t){
        if(t-b > 0)
        {
            return a*1.0;
        }
        else
        {
            return 0;
        } 
    }
}

var renderer = {
    canvasSize: new Vector2(600,600),
    markerSize: 0,
    markerDistance: 0,
    clearCanvas: function(){
        context.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
    },
    renderAxis: function(position, scale) {
        this.markerSize = 10;
        this.markerDistance = 20*scale;
        //X axis
        this.renderLine(position, new Vector2(position.x + this.canvasSize.x, position.y), "#0000FF");
        this.renderLine(position, new Vector2(position.x - this.canvasSize.x, position.y), "#0000FF");
        
        //Y axis
        this.renderLine(position, new Vector2(position.x, position.y + this.canvasSize.y), "#FF0000");
        this.renderLine(position, new Vector2(position.x, position.y - this.canvasSize.y), "#FF0000");

        context.textAlign="center";
        var textSize = 6*scale;
        context.font = textSize +"px Arial";
        //X axis markers
        for(var i = parseInt(-this.canvasSize.x / this.markerDistance); i < this.canvasSize.x / this.markerDistance; i++)
        {
            var beginPosition = new Vector2( position.x + this.markerDistance * i, position.y - this.markerSize*0.5);
            var endPosition = new Vector2(beginPosition.x, beginPosition.y + this.markerSize);
            if(i!=0) context.fillText(i.toString(), beginPosition.x, beginPosition.y + textSize + 15);
            this.renderLine(beginPosition, endPosition, "#0000FF");
        }
        //Y axis markers
        for(var i = parseInt(-this.canvasSize.y / this.markerDistance); i < this.canvasSize.y / this.markerDistance; i++)
        {
            var beginPosition = new Vector2(position.x - this.markerSize*0.5, position.y + this.markerDistance * i);
            var endPosition = new Vector2(beginPosition.x + this.markerSize, beginPosition.y);
            this.renderLine(beginPosition, endPosition, "#FF0000");
        }
    },
    renderLine: function(beginPosition, endPosition, color){
        var oldStrokeStyle = context.strokeStyle;
        if(color != null) 
        {
            context.strokeStyle = color;
        }
        else
        {
            color = "#000000";
        }
        context.beginPath();
        context.moveTo(beginPosition.x, beginPosition.y);
        context.lineTo(endPosition.x, endPosition.y);
        context.stroke();
    },
    drawSubfunctions: function(currentAxisPosition, subFunctions)
    {
        var imageData = context.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);
        for(var i = 0; i<this.canvasSize.x; i++)
        {
            var distToAxis = currentAxisPosition.x - i;
            var t = -distToAxis/this.markerDistance;
            
            var value = 0;
            for(var j = 0; j<subFunctions.length; j++)
            {
                value = value + subFunctions[j].getValue(t);
            }
            //if(t>0.1) console.log("a:" + subFunctions[0].a + "b:" + subFunctions[0].b + subFunctions[0].getValue(t) + " " + "a:" + subFunctions[1].a + "b:" + subFunctions[1].b + subFunctions[1].getValue(t) + " " + value + " t: " + t);
            yPixValue = parseInt(-value * this.markerDistance + currentAxisPosition.y);
            
            var k = 4 * (yPixValue*this.canvasSize.x + i);
            imageData.data[k] = 0;
            imageData.data[k + 1] = 0;
            imageData.data[k + 2] = 0;
            imageData.data[k + 3] = 255;
        }
        context.putImageData(imageData,0,0);
    }
};

var logic = {
    currentMousePos: new Vector2(300,300),
    currentAxisPosition: new Vector2(300,300),
    subFunctions: [],
    mouseHandler: {
    },
    updateEquals: function(equal)
    {
        logic.subFunctions = [];
        for(var i = 0; i < subfunctionsNumber; i++)
        {
            var a = parseInt($("#a"+i).val());
            var b = parseInt( $("#b"+i).val());
            logic.subFunctions.push( new subFunction(a,b));
        }
        console.log(this.subFunctions.length);
    },
    setMousePos: function(newMousePos)
    {
        logic.currentMousePos = newMousePos;
    },
    updateAxisPosition: function()
    {
        logic.currentAxisPosition = logic.currentMousePos;
    },
    updateDraw: function()
    {
        renderer.clearCanvas();
        renderer.renderAxis(logic.currentAxisPosition, scale);
        renderer.drawSubfunctions(logic.currentAxisPosition, logic.subFunctions);
    }
};



$( "#subFunctionsNumberForm" ).submit(function( event ) {
    subfunctionsNumber = $("#subFunctionsNumberForm").find('input[name="subfunctionsNumber"]').val();
    $("#equal").empty();
    if(subfunctionsNumber>0)
    {
        $("#equal").append("<b> V(t) = </b>");
        for(var i = 0; i < subfunctionsNumber; i++)
        {
            $("#equal").append(' <input id="a' + i + '" type="number" class="inputField" value="1"> * U(t - <input id="b' + i + '" type="number" class="inputField" value="1">)');
            if( i != (subfunctionsNumber-1))
            {
                $("#equal").append('<b style="background-color:#00AA00; margin-left:5px; margin-right:5px;"> + </b>');
            }
        }
        $("#equal").append('<br> <input type="submit" value="Show">');
    }
    return false;
});

$("#equal").submit(function(event){
    logic.updateEquals();
    logic.updateDraw();
    event.preventDefault();
});

var scale = 1.0;
var mouseCurrentState = '';
var mouseHoldPosition;
canv.addEventListener('mousemove', function(evt) {
    if(mouseCurrentState == "mousedown")
    {
        var rect = canv.getBoundingClientRect();
        var currentMousePos = new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
        if(mouseHoldPosition == null) mouseHoldPosition = currentMousePos;
        var newMousePos = new Vector2(logic.currentMousePos.x + (currentMousePos.x - mouseHoldPosition.x)*0.5, logic.currentMousePos.y + (currentMousePos.y - mouseHoldPosition.y)*0.5 );
        logic.setMousePos(newMousePos);
        logic.updateAxisPosition();
        logic.updateDraw();
    }
    var rect = canv.getBoundingClientRect();
        mouseHoldPosition = new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
   
  }, false);

$('#myCanvas').on('mousedown mouseup', function mouseState(e) {
    mouseCurrentState = e.type;
});

canv.addEventListener('wheel', function(evt) {
    scale += (evt.deltaY > 0 ? 0.1 : -0.1);
    if(scale <=0.1 ) scale = 0.2;
    logic.updateDraw();
}, false);