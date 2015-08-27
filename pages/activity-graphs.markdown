---
layout:       page
title:        Activity Graphs
permalink:    /activity-graphs/
menu_index:   5
menu_visible: false
---

<script type="text/javascript" src="https://www.google.com/jsapi"></script>
<script type="text/javascript">
    //
    // Google Charts API reference:
    //   https://google-developers.appspot.com/chart/
    //

    google.load("visualization", "1", { packages: ["corechart"] });

    function drawBlogActivityChart() {

        // Map a date (post dates) to a number (number of posts in that date).
        // I only care about year and month. Jekyll already gives us the post
        // dates sorted from most recent to oldest.
        var activityMap = { };
        function addEntry(date) {
            if (activityMap[date] === undefined) {
                activityMap[date] = 1;
            } else {
                activityMap[date] += 1;
            }
        }

        // ** BEGIN GENERATED CODE **
        //
        {% for post in site.posts %}
            {% assign js_date = post.date | date: "%b, %Y" %}
            {% if js_date %}
                addEntry( "{{ js_date }}" );
            {% endif %}
        {% endfor %}
        //
        // ** END GENERATED CODE **

        var propKey, rows = [ ];
        var barStyle = "color: green; opacity: 0.4;";
        rows.push([ "Date", "Posts", { role: "style" } ]);

        for (propKey in activityMap) {
            rows.push([ propKey, activityMap[propKey], barStyle ]);
        }

        var data = google.visualization.arrayToDataTable(rows);
        var view = new google.visualization.DataView(data);

        view.setColumns([ 0, 1, {
            sourceColumn: 1,
            calc: "stringify",
            type: "string",
            role: "annotation"
            }, 2 ]);

        var chartOptions = {
            title:  "Blog activity by date:",
            hAxis:  { minValue:   0      },
            bar:    { groupWidth: "85%"  },
            legend: { position:   "none" }
        };

        // Actually generate and show the chart:
        var chart = new google.visualization.BarChart(document.getElementById("blog-activity-chart"));
        chart.draw(view, chartOptions);

    } // end drawBlogActivityChart()

    function drawCategoryUsageChart() {

        var categoryList  = [ "Category" ];
        var allCategories = { };
        var activityMap   = { };

        // Build the `allCategories` template list.
        function addCategory(categories) {
            var categoryNames = categories.split(",");
            for (var i = 0; i < categoryNames.length; ++i) {
                allCategories[categoryNames[i]] = 0;
            }
        }

        // Maps a date (month + year) to a value (number of posts), per post category.
        function addEntry(date, categories) {
            var categoryNames = categories.split(",");
            for (var i = 0; i < categoryNames.length; ++i) {
                var cat = categoryNames[i];
                if (activityMap[date] === undefined) {
                    // First reference to this date.
                    activityMap[date] = JSON.parse(JSON.stringify(allCategories)); // Hack to clone an object. Oh JavaScript...
                    activityMap[date][cat] = 1;
                } else {
                    activityMap[date][cat] += 1;
                }
                // Save one occurrence of each category for later.
                if (categoryList.indexOf(cat) < 0) {
                    categoryList.push(cat);
                }
            }
        }

        // ** BEGIN GENERATED CODE **
        //
        {% for post in site.posts %}
            addCategory( "{{ post.categories | join: ',' }}" );
        {% endfor %}

        {% for post in site.posts %}
            {% assign js_date = post.date | date: "%b, %Y" %}
            {% if js_date %}
                addEntry( "{{ js_date }}", "{{ post.categories | join: ',' }}" );
            {% endif %}
        {% endfor %}
        //
        // ** END GENERATED CODE **

        var rows = [ ];
        var mapKey, cat, catKey, catRow;

        categoryList.push({ role: "annotation" });
        rows.push(categoryList);

        // mapKey is a date, cat has the counts for that date.
        for (mapKey in activityMap) {
            cat    = activityMap[mapKey];
            catRow = [ mapKey ];

            for (catKey in cat) {
                catRow.push(cat[catKey]);
            }
            catRow.push("");

            rows.push(catRow);
        }

        var data = google.visualization.arrayToDataTable(rows);
        var view = new google.visualization.DataView(data);

        var chartOptions = {
            title:     "Category/Tag usage by Post dates:",
            hAxis:     { minValue:   0     },
            bar:       { groupWidth: "85%" },
            legend:    { position:   "top", maxLines: 2 },
            isStacked: true
        };

        // Actually generate and show the chart:
        var chart = new google.visualization.BarChart(document.getElementById("category-usage-chart"));
        chart.draw(view, chartOptions);

    } // end drawCategoryUsageChart()

    google.setOnLoadCallback(drawBlogActivityChart);
    google.setOnLoadCallback(drawCategoryUsageChart);

</script>

<style type="text/css">
    .chart {
        width:            inherit;
        height:           inherit;
        min-height:       inherit;
        background-color: inherit;
    }
    .chart-container {
        width:            100%;
        height:           auto;
        min-height:       800px;
        background-color: white;
        /* Same shadow effect used by images */
        -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 0, 0, 0.2) inset;
        -moz-box-shadow:    0 4px 8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 0, 0, 0.2) inset;
        -o-box-shadow:      0 4px 8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 0, 0, 0.2) inset;
        box-shadow:         0 4px 8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 0, 0, 0.2) inset;
    }
</style>

<div class="chart-container">
  <div id="blog-activity-chart"  class="chart"></div>
  <div id="category-usage-chart" class="chart"></div>
</div>

