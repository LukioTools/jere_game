import socket as s
int_size = 8
byteorder = "little"
str_encoding = "utf8"

def sendint(conn:s.socket, n:int):
    conn.send(n.to_bytes(int_size, byteorder))
    return 0


def recvInt(conn:s.socket):
    r = conn.recv(int_size)
    return int.from_bytes(r, byteorder)
    

def sendString(conn:s.socket, stirng:str):
    sendint(conn, len(stirng))
    conn.send(bytes(stirng, str_encoding))
    return 0

def recvString(conn:s.socket):
    inc_lenght = recvInt(conn)
    inc_string = str(conn.recv(inc_lenght), str_encoding)
    return inc_string

def sendChar(conn:s.socket, char:str):
    sendint(conn, 2)
    conn.send(bytes(char+" ", str_encoding))
    return 0
    
def recvChar(conn:s.socket):
    inc_lenght = recvInt(conn)
    ch = str(conn.recv(inc_lenght), str_encoding)[0]
    return ch
