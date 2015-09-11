var template_path = Qva.Remote + "?public=only&name=Extensions/RadialTree/";
function extension_Init()
{
    Qva.LoadScript(template_path + "jquery.js", function() {
    	Qva.LoadScript(template_path + "d3.min.js", extension_Done);
    });
}

if (Qva.Mgr.mySelect == undefined) {
    Qva.Mgr.mySelect = function (owner, elem, name, prefix) {
        if (!Qva.MgrSplit(this, name, prefix)) return;
        owner.AddManager(this);
        this.Element = elem;
        this.ByValue = true;

        elem.binderid = owner.binderid;
        elem.Name = this.Name;

        elem.onchange = Qva.Mgr.mySelect.OnChange;
        elem.onclick = Qva.CancelBubble;
    }
    Qva.Mgr.mySelect.OnChange = function () {
        var binder = Qva.GetBinder(this.binderid);
        if (!binder.Enabled) return;
        if (this.selectedIndex < 0) return;
        var opt = this.options[this.selectedIndex];
        binder.Set(this.Name, 'text', opt.value, true);
    }
    Qva.Mgr.mySelect.prototype.Paint = function (mode, node) {
        this.Touched = true;
        var element = this.Element;
        var currentValue = node.getAttribute("value");
        if (currentValue == null) currentValue = "";
        var optlen = element.options.length;
        element.disabled = mode != 'e';
        //element.value = currentValue;
        for (var ix = 0; ix < optlen; ++ix) {
            if (element.options[ix].value === currentValue) {
                element.selectedIndex = ix;
            }
        }
        element.style.display = Qva.MgrGetDisplayFromMode(this, mode);
    }
}

function extension_Done(){
  //localStorage.setItem('key', 'test1') ;
  //alert(localStorage.getItem('key'));
	Qva.AddExtension('RadialTree', function(){
		Qva.LoadCSS(template_path + "style.css");
		var _this = this;

    var rotation = _this.Layout.Text0.text.toString();
		var diameter = _this.Layout.Text1.text.toString();
    var nodeDistance = _this.Layout.Text2.text.toString();
    var showValues = _this.Layout.Text3.text.toString();

    if(showValues == '' || showValues == 0) {
      showValues = false;
    } else {
      showValues = true;
    }

    console.log(showValues)
		var divName = _this.Layout.ObjectId.replace("\\", "_");

		if(_this.Element.children.length == 0) {
			var ui = document.createElement("div");
			ui.setAttribute("id", divName);
			_this.Element.appendChild(ui);
			//$('#' + divName).css('border-width', '0');
	    //$('#' + divName).css('border', '3px solid black');
		} else {
			$("#" + divName).empty();
		}
		//var html = "";
		var td = _this.Data;
		var nodesArray = [];
		var parents = [];
		for(var rowIx = 0; rowIx < td.Rows.length; rowIx++) {

			var row = td.Rows[rowIx];
			var val1 = row[0].text;
			var val2 = row[1].text;
			var m = row[2].text;

			var node =  [{"name":val2},{"parent":val1},{"size":m}];
			nodesArray.push(node);
			parents.push(row[0].text)
		}

	 var uniqueParents = parents.filter(function(itm,i,a){
	 	return i==a.indexOf(itm);
	 });

	 if( uniqueParents.length == 1 ) {
		 nodesArray.push([{"name":uniqueParents[0]},{"parent":'-'},{"size":1}]);
	 }

		var nodesJson = createJSON(nodesArray);
		function createJSON(Data) {
		  var happyData = Data.map(function(d) {
		    return {
		      name: d[0].name,
		      parent: d[1].parent,
		      size: d[2].size
		    };
		  });

		  function getChildren(name) {
		    return happyData.filter(function(d) { return d.parent === name; })
		      .map(function(d) {
              var values = '';
              if( showValues == true ) {
                values = ' (' + d.size + ')';
              }
		        return {
		          name: d.name + '' + values,
		          size: d.size,
		          children: getChildren(d.name)
		        };
		      });
		  }
		  return getChildren('-')[0];
		}

		//var diameter = 360;

		var tree = d3.layout.tree()
		    .size([rotation, diameter / nodeDistance - 90])
		    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

		var diagonal = d3.svg.diagonal.radial()
		    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

		var svg = d3.select("#" + divName).append("svg")
				//.attr("style", "outline: thin solid red;")
		    .attr("width", diameter)
		    .attr("height", diameter - 150)
		  	.append("g")
		    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
		var root = nodesJson;

		  var nodes = tree.nodes(root),
		      links = tree.links(nodes);

		  var link = svg.selectAll(".link")
		      .data(links)
		      .enter().append("path")
		      .attr("class", "link")
		      .attr("d", diagonal);

		  var node = svg.selectAll(".node")
		      .data(nodes)
		      .enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

		  node.append("circle")
		      .attr("r", 4.5);

		  node.append("text")
		      .attr("dy", ".31em")
		      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
		      .text(function(d) { return d.name /*+ ' (' + d.size + ')'*/; });

		d3.select(self.frameElement).style("height", diameter - 150 + "px");
	});
}

//Initiate extension
extension_Init();
