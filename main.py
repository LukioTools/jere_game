from sys import exit

import getch
debug = True
import os
import socket as s
import json
import socket_shenanigans as ss
import time

srv_socket = s.socket(s.AF_INET, s.SOCK_STREAM)
byteorder = "little"
str_encoding = "utf8"

int_size = 8
PORT = 8088


new_players = []

skip_board = False

maxes= {
    "x": 0,
    "y": 0
}


xarr = []

def stopGame():
    for i in new_players:
        if(i["type"] == "remote"):
            i["conn"].close()
    srv_socket.close()
    exit(0)

def lobbyPrint():
    print("Players:", end="")
    print("\n", end="")
    for i in new_players:
        print(f"[ id: {i['id']}, char: \'{i['char']}\'", end="")
        if(i["type"] == "remote"):
            print(f", address: {i['addr'][0]} ]", end="")
        else:
            print(f" ] ", end="")
        print(" ", end="")
        
    print("\n", end="")
            

def initSocket():
    #print(f"Localhost ? y|N")
    #ch = getch.getch()
    bind_address = "0.0.0.0"
    #if(ch.lower() == "y"):
    #    bind_address = "127.0.0.1"
    while True:
        try:
            srv_socket.bind((bind_address, PORT))
            srv_socket.listen()
            break
        except:
            try:
                clear()
                print("Trying again... press Ctrl + C to not use networking (offline)")
                time.sleep(2)
            except KeyboardInterrupt:
                break

 
def initRemote(n:int = 1):
    print(f"Waiting for connection to {s.gethostbyname(s.gethostname())}  {PORT}(local address)")
    try:
        conn, addr = srv_socket.accept()
        print(f"Connected From {addr}")
        print("Getting new_players charachter")
        ch = ss.recvChar(conn)
        print(f"got {ch}")
        ss.sendString(conn, f"got {ch}")
        new_players.append({"type": "remote", "char": ch, "id": len(new_players), "conn": conn, "addr": addr})
        return 0
    except:
        print("Got an error... try again..")
        return -1
    
def initLocal(char:str=""):
    if(char == ""):
        print(f"Enter charachter for player {len(new_players)}")
        while True:
            try:
                char = getch.getch()
                break
            except:
                pass
    new_players.append({"type": "local", "char": char, "id": len(new_players)})
    #new_players.append(char)
    return 0

def lobby():
    while True:
        clear()
        lobbyPrint()
        print(" N: new local player\n R: new remote player\n S: start the game\n Q: quit the game")
        try:
            char = getch.getch().lower()
        except:
            try:
                stopGame()
            except:
                stopGame()
        if(char == "n"):
            initLocal()
        elif(char == "r"):
            initRemote()
        elif(char == "s"):
            if(len(new_players) == 0):
                print("Please add a player before starting...")
                time.sleep(2)
                pass
            else:
                break
        elif(char == "q"):
            stopGame()
    gameLoop()
    return 0
        
        
def tceIntLoop(prompt = ""):
    ret = -1
    while True:
        try:
            ret = int(input(prompt))
            return ret
        except:
            pass
        
def charTceIntLoop(prompt = ""):
    ret = -1
    while True:
        try:
            print(prompt, end = "")
            ret = int(getch.getch())
            return ret
        except:
            pass

def uint(prompt = ""):
    while True:
        ret = tceIntLoop(prompt)
        if(ret > 0):
            return ret

def nnuit(prompt = ""):
    while True:
        ret = tceIntLoop(prompt)
        if(ret >= 0):
            return ret
        
def xnnuit(prompt = ""):
    while True:
        if(maxes['x'] <= 10):
            ret = charTceIntLoop(prompt)
        else:
            ret = tceIntLoop(prompt)
        if(ret >= 0):
            return ret

def ynuit(prompt = ""):
    while True:
        if(maxes['y'] <= 10):
            ret = charTceIntLoop(prompt)
        else:
            ret = tceIntLoop(prompt)
        if(ret >= 0):
            return ret

def initBoard(x:int = 0, y:int = 0):
    maxes['x'] = x
    maxes['y'] = y
    if(x == 0):
        maxes['x'] = uint("Boardsize: x\n")
    if(y == 0):
        maxes['y'] = uint("Boardsize: y\n")
    
    for i in range(maxes['x']):
        yarr = []
        for j in range(maxes['y']):
            yarr.append(' ')
        xarr.append(yarr)
    return 0

def printBoard():
    for i in range(maxes['x']):
        for j in range(maxes['y']):
            #boardCh = 
            if(j == 0):
                if(i == 0):
                    print("   ", end="")
                    for d in range(maxes['y']):
                        print(f" {d} ", end="")
                    print("\n", end="")
                print(f" {i} ", end="")
            
            print(f"[{xarr[i][j]}]", end="")
            j += 1
        print("\n", end="")
        i += 1
    pass

def clear():
    # For Windows
    if os.name == 'nt':
        os.system('cls')
    # For macOS and Linux
    else:
        os.system('clear')


#TODO captured    
def checkCaptured(x, y):
    return False

def checkUp(x_cord, y_cord, player_num:int):
    
    if(x_cord >= 2):
        if(xarr[x_cord - 2][y_cord] == new_players[player_num]['char']):
            if(checkCaptured(x_cord - 1, y_cord) or xarr[x_cord - 1][y_cord] == new_players[player_num]['char']):
                pass
            else:
                xarr[x_cord - 1][y_cord] = new_players[player_num]['char']
                checkAdjacent(x_cord - 1, y_cord, player_num)
                return True
    else:
        return False

def checkDown(x_cord, y_cord, player_num:int):
    if(x_cord <= (maxes['x']-1)-2):
        if(xarr[x_cord + 2][y_cord] == new_players[player_num]['char']):
            if(checkCaptured(x_cord + 1, y_cord) or xarr[x_cord + 1][y_cord] == new_players[player_num]['char']):
                pass
            else:
                xarr[x_cord + 1][y_cord] = new_players[player_num]['char']
                checkAdjacent(x_cord + 1, y_cord, player_num)
                return True
    else:
        return False

def checkLeft(x_cord, y_cord, player_num:int):
    if(y_cord >= 2):
        if(xarr[x_cord][y_cord - 2] == new_players[player_num]['char'] or xarr[x_cord][y_cord - 1] == new_players[player_num]['char']):
            if(checkCaptured(x_cord, y_cord -1)):
                pass
            else:
                xarr[x_cord][y_cord - 1] = new_players[player_num]['char']
                checkAdjacent(x_cord, y_cord - 1, player_num)
                return True
    else:
        return False

def checkRight(x_cord, y_cord, player_num:int):
    if(y_cord <= (maxes['y']-1) -2):
        if(xarr[x_cord][y_cord + 2] == new_players[player_num]['char']):
            if(checkCaptured(x_cord, y_cord + 1) or xarr[x_cord][y_cord + 1] == new_players[player_num]['char']):
                pass
            else:
                xarr[x_cord][y_cord + 1] = new_players[player_num]['char']
                checkAdjacent(x_cord, y_cord + 1, player_num)
                return True
    else:
        return False
        
def checkAdjacent(x_cord, y_cord, player_num:int):
    
    if(boundsCheck(x_cord, x_cord) == False):
        print(f"failed:{x_cord}|{y_cord}")
        return False
    checkUp(x_cord, y_cord, player_num)
    checkDown(x_cord, y_cord, player_num)
    checkLeft(x_cord, y_cord, player_num)
    checkRight(x_cord, y_cord, player_num)
    
    return True


def boundsCheck(x, y):
    if(x >= maxes['x']):
        print(f"boundsCheck:x:{x} >= {maxes['x'] -1}")
        return False
    if(y >= maxes['y']):
        print(f"boundsCheck:y:{y} >= {maxes['y'] -1}")
        return False
    return True

def clearFromBoardWhereChar(ch:str):
    for i in range(maxes['x']):
        for j in range(maxes['y']):
            if(xarr[i][j] == ch):
                xarr[i][j] = " "


def player(player:int):
    while True:
        clear()
        printBoard()
        printForRemote()
        if(new_players[player]["type"] == "remote"):
            try:
                print(f"Awaiting players {player} ({new_players[player]['char']}) input")
                ss.sendString(new_players[player]["conn"], json.dumps(xarr))
                ss.sendString(new_players[player]["conn"], f"Player {player} Enter X position\n")
                ychar = ss.recvInt(new_players[player]["conn"])
                ss.sendString(new_players[player]["conn"], f"Player {player} Enter Y position\n")
                xchar = ss.recvInt(new_players[player]["conn"])
            except BrokenPipeError:
                print(f"Player {player} ({new_players[player]['char']}) disconnected")
                clearFromBoardWhereChar(new_players[player]['char'])
                del new_players[player]
                return -1
            
        elif(new_players[player]["type"] == "local"):
            ychar = ynuit(f"Player {player} Enter X position\n")
            xchar = xnnuit(f"Player {player} Enter Y position\n")
        else: raise "Unknown player type"
        
        
        if(boundsCheck(xchar, ychar) == False):
            continue
        if(xarr[xchar][ychar] == ' '):
            xarr[xchar][ychar] = new_players[player]['char']
            checkAdjacent(xchar, ychar, player)
            break
        else:
            #failure to place
            pass
        
    return 0

def printForRemote():
    jp = json.dumps(xarr)
    for i in new_players:
        if(i["type"] == "remote"):
            ss.sendString(i["conn"], jp)
            pass

def gameEnd():
    clear()
    printBoard()
    printForRemote()
    print("Game has ended\n Winner is: ", end="")
    playerpoints = []
    for i in range(len(new_players)):
        playerpoints.append(0)
        
    for i in range(maxes['x']):
        for j in range(maxes['y']):
            for p in range(len(new_players)):
                if(xarr[i][j] == new_players[p]['char']):
                    playerpoints[p] += 1
                    
    max_points = max(playerpoints)
    idx = 0
    j=0
    for i in playerpoints:
        if(i == max_points):
            idx == j 
        j+=1
    #print(f"{j}:{idx}:{new_players}")
    print(f"[{new_players[idx]['char']}]")
    pass

def checkEnd():
    res = False
    for a in xarr:
        if ' ' in a:
            res = True
    return res

#todo break when shit is not in the fan
def gameLoop():
    while True:
        br = False
        if(len(new_players) == 0):
            br = True
            break
        for i in range(len(new_players)):
            if(player(i) == -1): break #connection deleted so need to re init the for loop
            if(checkEnd() == False): # works
                br = True
                break
        if(br == True):
            break
            
    gameEnd()
    return 0

if(skip_board):
    initBoard(6,6)
else:
    initBoard()



initSocket()
ret = lobby()
exit(ret)


