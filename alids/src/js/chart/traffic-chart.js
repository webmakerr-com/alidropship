jQuery(function ($) {

    window.lineChart = {

        chartData: function (element, action, method, from, to, height) {
            let panel = $(element).closest('.panel')
            if(panel.length > 0) {
                panel.addClass('animate-spinner');
            }

            var $this = this;

            $.ajax({
                url: ajaxurl,
                data: {
                    action: action,
                    from: from,
                    to: to,
                    method: method
                },
                type: 'POST',
                dataType: 'json',
                success: function (response) {
                    if(panel.length > 0) {
                        panel.removeClass('animate-spinner');
                    }
                    if (response) {

                        if (response.hasOwnProperty('error')) {
                            window.ADS.notify(response.error, 'danger');
                        } else {
                            d3.select(element).selectAll('svg').remove();
                            $this.chartRender(element, height, response, from, to);
                        }
                    }
                }
            });
        },

        chartRender: function (element, height, response, from, to) {

            const d3Container = d3.select(element);

            const margin = {top: 42, right: 30, bottom: 30, left: 50},
                width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;


            var formatDate = from !== to ? d3.time.format("%B %d, %Y") : d3.time.format("%H:00");

            if(response.isMonths){
                formatDate = d3.time.format("%B, %Y")
            }

            if(response.isYears){
                formatDate = d3.time.format("%Y")
            }

            // Format date
            var parseDate = from !== to ? d3.time.format("%Y/%m/%d").parse : d3.time.format("%Y-%m-%d %H:%M:%S").parse;

            // Tooltip
            const tooltip = d3.tip()
                .attr('class', 'd3-tip')
                .html(function (d) {

                    let amount = response.title_amount ? '<li>' + response.title_amount + ': &nbsp;<span class="text-semibold pull-right">' + d.sum_amount_clean + '</span></li>' : '';
                    let orders = response.title_orders ? '<li>' + response.title_orders + ': &nbsp;<span class="text-semibold pull-right">' + d.con_orders + '</span></li>' : '';
                    let sub_title = !amount && response.sub_title ? '<li>' + response.sub_title + ': &nbsp;<span class="text-semibold pull-right">' + d.value + '</span></li>' : '';

                    return '<ul class="list-unstyled mb-5">' +
                        amount +
                        orders +
                        sub_title +
                        '<li>' + response.time + ': &nbsp;<span class="text-semibold pull-right">' + formatDate(d.date) + '</span></li>' +
                        '</ul>';
                });


            var container = d3Container.append('svg');

            var svg = container
                .attr('width', width + margin.left)
                .attr('height', height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(tooltip);


            let data = response.data;

            var pointData = data.map(function (d) {
                return {
                    date: parseDate(d.date),
                    value: parseFloat(d.value),
                    sum_amount_clean: d.sum_amount_clean,
                    con_orders: d.con_orders,

                };
            });


            // Construct scales
            // ------------------------------

            // Horizontal
            var x = d3.time.scale()
                .domain([
                    d3.min(pointData, function (c) {
                        return c.date;
                    }),
                    d3.max(pointData, function (c) {
                        return c.date;
                    })
                ])
                .range([0, width]);

            // Vertical
            var y = d3.scale.linear()
                .domain([
                    d3.min(pointData, function (c) {
                        return c.value;
                    }),
                    d3.max(pointData, function (c) {
                        return c.value;
                    })
                ])
                .range([height, 0]);

            var xTicks = from !== to ? d3.time.days : d3.time.hours;
            var xFormat = from !== to ? d3.time.format('%b %d') : d3.time.format('%H:00');


            if (response.isYears) {
                xTicks = d3.time.years;
                xFormat = d3.time.format('%y');
            } else if (response.isMonths) {
                xTicks = d3.time.months;
                xFormat = d3.time.format('%b');
            }

            let getPointWidth = function(width, count){
                return parseInt(35*(width /50)/count);
            };

            let getTicks = function (width, count){
                let val = count*2/(width /60);
                return parseInt(val);
            }

            let ticks = getTicks(width, pointData.length);
            let pointWidth = getPointWidth(width, pointData.length);

            // Horizontal
            svg.append("g")
                .attr("class", "d3-axis d3-axis-horizontal d3-axis-solid sale-axis")
                .attr("transform", "translate(0," + height + ")");

            // Vertical
            svg.append("g")
                .attr("class", "d3-axis d3-axis-vertical d3-axis-transparent  sale-axis");


            // Horizontal
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickPadding(1)
                .ticks(xTicks, ticks)
                .innerTickSize(10)
                .tickFormat(xFormat); // Display hours and minutes in 24h format

            // Vertical
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(6)
                .tickSize(0 - width)
                .tickPadding(8);

            // Update vertical axes
            d3.transition(svg)
                .select(".d3-axis-vertical")
                .call(yAxis);

            // Update horizontal axes
            d3.transition(svg)
                .select(".d3-axis-horizontal")
                .attr("transform", "translate(" + (pointWidth) + "," + height + ")")
                .call(xAxis);


            var linearGradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "linear-gradient")
                .attr("gradientTransform", "rotate(90)");

            var colorRange = ['#0280BD', '#0073AA', '#014483'];

            var color = d3.scale.linear().range(colorRange).domain([1, 2, 3]);

            linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", color(1));

            linearGradient.append("stop")
                .attr("offset", "52%")
                .attr("stop-color", color(2));

            linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", color(3));


            pointData.map((item, n) => {
                svg.append('rect')
                    .attr('class', 'barr');

            });

            var barr = d3.selectAll('.barr')
                .data(pointData)
                .attr("height", function (d) {
                    return height+1 - y(d.value);
                })
                .attr("x", function (d, i) {
                    return x(d.date);
                })
                .attr("y", function (d) {
                    return y(d.value);
                })
                .attr('width', pointWidth)
                .attr("transform", "translate(" + pointWidth / 2 + ", 0)")
                .style("fill", "url(#linear-gradient)");

            // Add tooltip on circle hover
            barr
                .on("mouseover", function (d) {
                    tooltip.offset([-15, 0]).show(d);

                    // Animate circle radius
                    d3.select(this).transition().duration(250).attr('r', 4);
                })
                .on("mouseout", function (d) {
                    tooltip.hide(d);

                    // Animate circle radius
                    d3.select(this).transition().duration(250).attr('r', 3);
                });


            // Resize chart
            // ------------------------------

            // Call function on window resize
            $(window).on('resize', appSalesResize);


            // Call function on sidebar width change
            $(document).on('click', '.sidebar-control', appSalesResize);

            // Resize function
            //
            // Since D3 doesn't support SVG resize by default,
            // we need to manually specify parts of the graph that need to
            // be updated on window resize
            function appSalesResize() {

                // Layout
                // -------------------------

                // Define width
                let width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;

                // Main svg width
                container.attr("width", width + margin.left + margin.right);

                // Width of appended group
                svg.attr("width", width + margin.left + margin.right);

                // Horizontal range
                x.range([0, width]);

                // Vertical range
                y.range([height, 0]);


                // Chart elements
                // -------------------------

                // Horizontal axis
                svg.select('.d3-axis-horizontal').call(xAxis);

                // Vertical axis
                svg.select('.d3-axis-vertical').call(yAxis.tickSize(0 - width));

                ticks = getTicks(width, pointData.length);
                pointWidth = getPointWidth(width, pointData.length);

                xAxis.ticks(xTicks, ticks);

                d3.selectAll('.barr')
                    .data(pointData)
                    .attr("height", function (d) {
                        return height - y(d.value);
                    })
                    .attr("x", function (d, i) {
                        return x(d.date);
                    })
                    .attr("y", function (d) {
                        return y(d.value);
                    })
                    .attr('width', pointWidth)
                    .attr("transform", "translate(" + pointWidth / 2 + ", 0)")
                    .style("fill", "url(#linear-gradient)");

                d3.transition(svg)
                    .select(".d3-axis-horizontal")
                    .attr("transform", "translate(" + (pointWidth) + "," + height + ")")
                    .call(xAxis);

            }

        },

    };
});
