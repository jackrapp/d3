// Use python -m http.server to run the visualization. 
// This will host the page at localhost:8000 in your web browser.

// Initial scatter plot between two of the data variables
// x-axis options: age, income, healthcare
// y-axis options: smoking, obesity

// Add function to resize when screen size changes
function makeResponsive() {

    // Checking to see if svg exists and removing it on resize
    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
        svgArea.remove();
    };

    // Chart set-up
    // SVG size based on size of column ratio of 16:9 width:height
    var svgWidth = document.getElementById('scatter').clientWidth;
    var svgHeight =  svgWidth / 1.8;

    // Chart margins
    var chartMargin = {
        top: 30,
        right: 30,
        bottom: 90,
        left: 70
    };

    // Combine chart margins and SVG size
    var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;

    // Define SVG element
    var svg = d3.select('#scatter')
        .append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth)
        .attr('class','chartArea');

    // Add chart group within SVG and shift to fit the margins
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
    // Added second group for labels/text because all the state labels were not showing up when appending to chartGroup
    var textGroup = svg.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`)
        .attr('class', 'stateLabels');

    // Setup default values
    var chosenXAxis = "age";
    var chosenYAxis = 'obesity';

// Function to read csv, append chartgroup and add markerinfo to plot
// Pull in data from csv
d3.csv('assets/data/data.csv')
    
    // error checking
    .catch(function(error) {
        throw (error);
    })

    .then(function(data) {
    // run this to see what is in the data
    // also to make sure the data loads
    console.log(data);

        // convert data to numerical values
        data.forEach(function(state) {
            state.age = +state.age;
            state.healthcare = +state.healthcare;
            state.income = +state.income;
            state.obesity = +state.obesity;
            state.smokes = +state.smokes;
        });
   
        // set scale based on max/min values
        // create function to change the scale
        var xLinearScale = xScale(data, chosenXAxis, chartWidth);

        // Create y scale function
        var yLinearScale = yScale(data, chosenYAxis, chartHeight);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Add x axis to chart
        // Will add variable name and class if changing data
        var xAxis = chartGroup.append('g')
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // Add y axis to chart
        // Will add variable name and class if changing data
        var yAxis = chartGroup.append('g').call(leftAxis);

        // Add x-axis and y-axis labels
        // Create group for  3 x- axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        // first x-axis label
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "age") // value to grab for event listener
            .classed("active", true)
            .text("Age (Median)");
        
        // second x-axis label
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // third x-axis label
        var healthcareLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "healthcare") // value to grab for event listener
            .classed("inactive", true)
            .text("Lack of Healthcare (%)");

        // Group for 2 y-axis labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        // first y-axis label
        var obesityLabel = yLabelsGroup.append('text')
            .attr("y", 40 - chartMargin.left)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .text("Obese (%)");

        // second y-axis label
        var smokesLabel = yLabelsGroup.append('text')
            .attr("y", 20 - chartMargin.left)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        // Represent data using circle elements
        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 10)
            .attr("fill", "blue")
            .attr("opacity", ".6");

        // Include state abbreviations in the circles.
        // append state names as separate chart group
        var statesGroup = textGroup.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('x', d => xLinearScale(d[chosenXAxis]))
            .attr('y', d => yLinearScale(d[chosenYAxis]) + 5)
            .attr('text-anchor', 'middle')
            .attr('class', 'stateText')
            .text(d => d.abbr);

        // x axis labels event listener
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    
                    // replaces chosenXAxis with value
                    chosenXAxis = value;
                    console.log(chosenXAxis)
                    
                    // Run linear scale function to update x-axis scaling
                    xLinearScale = xScale(data, chosenXAxis, chartWidth);
                    
                    // updates x axis with transition
                    xAxis = renderAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                    // upadtes labels with new x values
                    statesGroup = renderLabels(statesGroup, xLinearScale, chosenXAxis);

                    // changes classes to change bold text
                    switch (chosenXAxis) {
                        case 'age': {
                            ageLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            incomeLabel
                                .classed('active', false)
                                .classed('inactive', true);
                            healthcareLabel
                                .classed('ative', false)
                                .classed('inactive', true);
                            break;
                        }
                        case 'income': {
                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            incomeLabel
                                .classed('active', true)
                                .classed('inactive', false);
                            healthcareLabel
                                .classed('active', false)
                                .classed('inactive', true);
                            break;
                        }
                        case 'healthcare': {
                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            incomeLabel
                                .classed('active', false)
                                .classed('inactive', true);
                            healthcareLabel
                                .classed('ative', true)
                                .classed('inactive', false);
                            break;
                        }
                        default: {
                            ageLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            incomeLabel
                                .classed('active', false)
                                .classed('inactive', true);
                            healthcareLabel
                                .classed('ative', false)
                                .classed('inactive', true);
                        }
                    } // end of switch/case
                } // end of if value == chosenAxis
            }); // end of click/change x-axis

        // y axis labels event listener
        yLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                
                // replaces chosenXAxis with value
                chosenYAxis = value;
                console.log(chosenYAxis)
                
                // Run linear scale function to update x-axis scaling
                yLinearScale = yScale(data, chosenYAxis, chartHeight);
                
                // updates x axis with transition
                yAxis = yRenderAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = yRenderCircles(circlesGroup, yLinearScale, chosenYAxis);

                // upadtes labels with new x values
                statesGroup = yRenderLabels(statesGroup, yLinearScale, chosenYAxis);

                // changes classes to change bold text
                switch (chosenYAxis) {
                    case 'obesity': {
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;
                    }
                    case 'smokes': {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        break;
                    }
                    default: {
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed('active', false)
                            .classed('inactive', true);
                    }
                } // end of switch/case
            } // end of if value == chosenAxis
        }); // end of click/change y-axis
        
    } // end .then function

  
); // end d3.csv

}; // end of makeResponsive function


// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// must call this function for the chart to be loaded initially
makeResponsive();


// // Extra content

// 1. More Data, More Dynamics

// Update xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis, chartWidth) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[chosenXAxis]))
      .range([0, chartWidth]);
  
    return xLinearScale;
}

// Update circles group with a transition
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    // transition to new x-value location
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
} // end of renderCircles function

// Update circles group with a transition
function renderLabels(statesGroup, newXScale, chosenXAxis) {
    // transition to new x-value location
    statesGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
  
    return statesGroup;
} // end of renderCircles function

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis, chartHeight) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[chosenYAxis]))
      .range([chartHeight, 0]);
  
    return yLinearScale;
}

// Update yAxis var upon click on axis label
function yRenderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// Update circles group with a transition
function yRenderCircles(circlesGroup, newYScale, chosenYAxis) {
    // transition to new x-value location
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
} // end of renderCircles function

// Update circles group with a transition
function yRenderLabels(statesGroup, newYScale, chosenYAxis) {
    // transition to new x-value location
    statesGroup.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]) + 5);
  
    return statesGroup;
} // end of renderCircles function
