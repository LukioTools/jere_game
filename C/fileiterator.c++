#include <iostream>
#include <filesystem>
#include <fstream>
#include <ostream>
#include <string>
#include <system_error>

#define c_buff_size 4

#define BYTE_TO_BINARY_PATTERN "%c%c%c%c%c%c%c%c"
#define BYTE_TO_BINARY(byte)  \
  ((byte) & 0x80 ? '1' : '0'), \
  ((byte) & 0x40 ? '1' : '0'), \
  ((byte) & 0x20 ? '1' : '0'), \
  ((byte) & 0x10 ? '1' : '0'), \
  ((byte) & 0x08 ? '1' : '0'), \
  ((byte) & 0x04 ? '1' : '0'), \
  ((byte) & 0x02 ? '1' : '0'), \
  ((byte) & 0x01 ? '1' : '0') 




auto path = "C:/Users/User/Desktop/test.txt";

typedef unsigned char f_buffer;

/*
if overflow, return true
*/
bool incrementBufferLittleEndian(f_buffer* buffer, size_t size){
    for (size_t i = 0; i < size; i++)
    {
        //little so starts first
        if(buffer[i] == 0xFF /*aka overflow*/){
            buffer[i] = 0x00;
            if(i == size - 1){
                //overflow at last element
                return true;
            }
        }
        else{
            buffer[i]++;
            break;
        }
    }
    return false;
}

/*
//if overflow, return true and set buffer to 0
bool incrementBufferBigEndian(f_buffer* buffer, size_t size){
    for (size_t i = size - 1; i >= 0; i--)
    {
        //big so starts last
        //std::cerr << i << "  " << buffer[i] << "  " << (buffer[i] == 0xFF ? "overflow" : "naw_cuh") << std::endl; 
        if(buffer[i] == 0xFF ){//aka overflow
            buffer[i] = 0x00;
            if(i == 0){
                //overflow at last element
                return true;
            }
        }
        else{
            buffer[i]++;
            break;
        }
    }
    return false;
}
*/

// Assumes little endian
void printBits(size_t const size, void const * const ptr)
{
    unsigned char *b = (unsigned char*) ptr;
    unsigned char byte;
    int i, j;
    
    for (i = size-1; i >= 0; i--) {
        for (j = 7; j >= 0; j--) {
            byte = (b[i] >> j) & 1;
            printf("%u", byte);
        }
        printf(" ");
    }
    puts("");
}


int main(int argc, char const *argv[])
{
    if(argc != 2){
        std::cerr << "Input path required" << std::endl;
        return 1;
    }

    //std::cerr << std::filesystem::current_path() << std::endl;



    std::string input_path(argv[1]);
    std::string current_path((std::filesystem::current_path()));

    //std::cerr << input_path.length() << "  " << current_path.length() <<  std::endl;

    //std::cerr << input_path.substr(0, current_path.length()) << std::endl;

    
    if(!std::filesystem::exists(argv[1])){
        std::cerr << "input_file not found" << std::endl;
        return 1;
    }
    if(input_path.length() <= current_path.length()){
        std::cerr << "Unsafe path: path shorter than current path" << std::endl;
        return 1;
    }
    if(std::filesystem::current_path() != input_path.substr(0, current_path.length())){
        std::cerr << "Unsafe path: path not in current path" << std::endl;
        return 1;
    }
    std::ifstream input_file;
    input_file.open(input_path, std::ios::binary);

    if (input_file.is_open() == false)
    {
        std::cerr << "input_file not found" << std::endl;
        return 1;
    }
    
    //impossible to overshoot because same size
    f_buffer input_buffer[c_buff_size];

    for (unsigned int i = 0; i < c_buff_size; i++)
    {
        input_buffer[i] = (f_buffer) input_file.get();
        //if(input_buffer[i] != (unsigned char) 255){
        //    input_buffer[i]++;
        //    break;
        //}
    }

    input_file.close();


    //could be a smarter way of incrementing during reading but... ima not do that now
    //lazyness
    //printf("%d %d %d %d\n", input_buffer[0], input_buffer[1], input_buffer[2], input_buffer[3]);
    if(incrementBufferLittleEndian(input_buffer, c_buff_size)){
        std::cerr << "Buffer overflow" << std::endl;
        return 1;
    }
    //printf("%d %d %d %d\n", input_buffer[0], input_buffer[1], input_buffer[2], input_buffer[3]);


    std::ofstream output_file;
    output_file.open(input_path, std::ios::trunc | std::ios::binary);
    if (output_file.is_open() == false){
        std::cerr << "input_file not found???????" << std::endl;
        return 1;
    }



     
    for (size_t i = 0; i < c_buff_size; i++)
    {
        //printf(BYTE_TO_BINARY_PATTERN"\n", BYTE_TO_BINARY(input_buffer[i]));
        output_file << (char) input_buffer[i];
    }
    output_file.close();

    //get int 4 fun
    /*
    unsigned int inders = 0;
    for (unsigned short int i = 0; i < c_buff_size; i++)
    {
        //inders = inders << (sizeof(unsigned short int));
        inders += input_buffer[i] << (i * 8);
        //printf(BYTE_TO_BINARY_PATTERN"\n", BYTE_TO_BINARY(input_buffer[i]));
        std::cerr << (short) input_buffer[i] << std::endl;
    }
    printBits(sizeof(unsigned int), &inders);
    std::cerr << inders << std::endl;
    */
    return 0;
}
