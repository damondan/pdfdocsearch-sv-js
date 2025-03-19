<nav class="routing">
	<a href="/">home</a>
	<a href="/diagram">diagram</a>
</nav>
<h1>diagram</h1>

<style lang="scss">
	.routing {
        grid-area: routing;
        a {
          font-family: $font-family-primary-cursive;
          font-size: 18px;
          font-weight: $font-weight-bold;;
          text-decoration: none;  /* Removes the underline */
          color: black;  /* Sets the text color */
          padding: 5px;  /* Adds some padding around the link */
          transition: all 0.3s ease;  /* Smooth transition for hover effect */
      
          &:hover {
            color: white;  
            background-color: #007BFF;  
            border-radius: 4px; 
          }
        }
    }
</style>