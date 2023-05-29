
def printBoard(xarr, max_x, max_y):
    for i in range(max_x):
        for j in range(max_y):
            #boardCh = 
            if(j == 0):
                if(i == 0):
                    print("   ", end="")
                    for d in range(max_y):
                        print(f" {d} ", end="")
                    print("\n", end="")
                print(f" {i} ", end="")
            print(f"[{xarr[i][j]}]", end="")
            j += 1
        print("\n", end="")
        i += 1
    pass