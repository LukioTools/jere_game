import getch as gc

if __name__ == "__main__":
    print("Host or Join (h|j)")
    while True:
        inp = gc.getch().lower()
        if(inp == "h"):
            import main
            break
        elif(inp == "j"):
            import client
            break
