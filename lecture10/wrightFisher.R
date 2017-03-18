plotWrightFisher <- function(N=12, G=21,sorted=T, unsorted=T, pch=1, seed=NA) {
  
  if (!is.na(seed)) {
  	set.seed(seed);
  }
  
  x <- rep(1:N, times=G); 
  y <- rep(0:(G-1), each=N)
  p <- sample(1:N,N*(G-1),replace=T)
  par(mar = c(3,5,1,1) + 0.1, mfrow=c(1,ifelse(sorted && unsorted, 2, 1)))
  
  plot(x,y,xlab="", ylab="Generations in the past", xaxt="n")
  mtext("individuals", side=1, line=1)

  if (unsorted) {
  	lx <- c(rbind(x[1:length(p)],p,NA))
    ly <- c(rbind(y,y+1,NA))
    lines(lx[1:(3*N*(G-1))],ly[1:(3*N*(G-1))],col="black")
    points(x,y,pch=16,col="white")
    points(x,y,pch=pch)
  }

  if (sorted) {
    if (unsorted) {
      plot(x,y,xlab="", ylab="Generations in the past", xaxt="n")
      mtext("individuals", side=1, line=1)
    }
    
    # the labels of the x after sorting
    xl <-  x[(((G-1)*N)+1):(G*N)];
    np <- c();
  
    for (i in (G-2):0) {
      
	  xl_parents <- xl[1:N];
	      
	  parents <- p[((i*N)+1):((i+1)*N)]
	  children <- x[((i*N)+1):((i+1)*N)]
      
      xl <- c(order(match(parents,xl_parents)),xl)

      np <- c(match(parents[xl[1:N]],xl_parents), np);  
    }

    lx <- c(rbind(x[1:length(p)],np,NA))
    ly <- c(rbind(y,y+1,NA))
    lines(lx[1:(3*N*(G-1))],ly[1:(3*N*(G-1))],col="black")
    points(x,y,pch=16,col="white")
    points(x,y,pch=pch)
    #text(x+0.05,y-0.05,xl)
    #text(x,y+0.5,np, col="red")
  }  
  
  result <- list(xl=xl, np=np, p=p)
  return (result)
}
