plotWrightFisher <- function(N=12, G=21,sort=T, pch=1) {
  x <- rep(1:N, times=G); 
  y <- rep(0:(G-1), each=N)
  p <- sample(1:N,N*(G-1),replace=T)
  plot(x,y,xlab="individuals", ylab="Generations in the past", xaxt="n")

  if (sort) {
    for (i in (G-1):0) {
      xi <- x[((i*N)+1):((i+1)*N)]
      pi <- p[((i*N)+1):((i+1)*N)]
      p[((i*N)+1):((i+1)*N)] <- pi[order(pi)]
      if (i > 0) {
       pi2 <- p[(((i-1)*N)+1):((i)*N)]
       p[(((i-1)*N)+1):((i)*N)] <- pi2[order(pi)]
      }
    }
  }  

  lx <- c(rbind(x,p,NA))
  ly <- c(rbind(y,y+1,NA))
  lines(lx[1:(3*N*(G-1))],ly[1:(3*N*(G-1))],col="black")
  points(x,y,pch=16,col="white")
  points(x,y,pch=pch)
}
