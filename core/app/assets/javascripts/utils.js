// jQuery Input Hints plugin
// Copyright (c) 2009 Rob Volk
// http://www.robvolk.com

jQuery.fn.inputHints=function() {
  // hides the input display text stored in the title on focus
  // and sets it on blur if the user hasn't changed it.
  
  // show the display text
  $(this).each(function(i) {
               $(this).val($(this).attr('title'))
               .addClass('hint');
               });
  
  // hook up the blur & focus
  return $(this).focus(function() {
                       if ($(this).val() == $(this).attr('title'))
                       $(this).val('')
                       .removeClass('hint');
                       }).blur(function() {
                               if ($(this).val() == '')
                               $(this).val($(this).attr('title'))
                               .addClass('hint');
                               });
};

// Variable dumper
/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 */
function dump(arr,level) {
  var dumped_text = "";
  if(!level) level = 0;
  
  //The padding given at the beginning of the line.
  var level_padding = "";
  for(var j=0;j<level+1;j++) level_padding += "    ";
  
  if(typeof(arr) == 'object') { //Array/Hashes/Objects
    for(var item in arr) {
      var value = arr[item];
      
      if(typeof(value) == 'object') { //If it is an array,
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += dump(value,level+1);
      } else {
        dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
      }
    }
  } else { //Stings/Chars/Numbers etc.
    dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
  }
  return dumped_text;
} 

// Capitalize string
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//pads left
String.prototype.lpad = function(padString, length) {
	var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}
// Format date mm/dd/yyyy hh:mm 
Date.prototype.std_format = function() {
  return (this.getMonth()+1) + '/' + this.getDate() + '/' + this.getFullYear() + ' ' + this.getHours().toString().lpad('0', 2) + ':' + this.getMinutes().toString().lpad('0', 2);
}