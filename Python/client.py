import os
import socket as s
import socket_shenanigans as ss
import json
import printBoard as pB
byteorder = "little"
str_encoding = "utf8"
int_size = 8
import getch

print("Input Address (ip or url)")
address = "127.0.0.1"
address = input("")

#print("Input PORT (usually 8088)")
PORT = 8088
#PORT = int(input(""))

conn=s.socket(s.AF_INET, s.SOCK_STREAM)
try:
    conn.connect((address, PORT))
except:
    print(f"Could not connecto to ({address}:{PORT})...\nIs the Host address correct?")
    exit(1)
        
def tryInt():
    while True:
        try:
            return int(getch.getch())
        except:
            pass
        
        
def tryIntStr():
    while True:
        try:
            return int(input(""))
        except:
            pass

def tx(xarr):
    char = ""
    if(len(xarr) <= 10):
        char =tryInt()
    else:
        char =tryIntStr()
    return char
def ty(xarr):
    char = ""
    if(len(xarr[0]) <= 10):
        char =tryInt()
    else:
        char =tryIntStr()
    return char

def initR():
    print(f"Input your players charachter..")
    ss.sendChar(conn, getch.getch())
    print(ss.recvString(conn))
    return 0

def incStrTry():
    try:
        print(ss.recvString(conn), end="")
    except KeyboardInterrupt:
        print("interrupt")

def daInputs(fstsr):
    print(fstsr, end="")
    ss.sendint(conn, tryInt())
    incStrTry()
    ss.sendint(conn, tryInt())
   

def gameL():
    RC = ss.recvString(conn)
    if(RC[0:6] == "Player"):
        daInputs(RC)
    else:
        xarr = json.loads(RC)
        clear()
        pB.printBoard(xarr, len(xarr), len(xarr[0]))


def clear():
    # For Windows
    if os.name == 'nt':
        os.system('cls')
    # For macOS and Linux
    else:
        os.system('clear')

    

initR()
while True:
    gameL()
    