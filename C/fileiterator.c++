#include <iostream>
#include <filesystem>
#include <fstream>
#include <ostream>
#include <string>
#include <string.h>
#include <system_error>

#define c_buff_size 4

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

bool output = false;
bool iterate = true;

int main(int argc, char const *argv[])
{
    if(argc < 2){
        std::cerr << "Input path required" << std::endl;
        return 1;
    }
    for (size_t i = 0; i < argc; i++)
    {
        if(strcmp(argv[i], "-s") == 0){
            output = true;
        }
        if(strcmp(argv[i], "-si") == 0){
            output = true;
            iterate = false;
        }
        if(strcmp(argv[i], "-i") == 0){
            output = true;
            iterate = false;
        }
    }
    


    std::string input_path(argv[1]);
    std::string current_path((std::filesystem::current_path()));

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
    if(iterate){
        //open file
        std::fstream input_file;
        input_file.open(input_path, std::fstream::in | std::fstream::out);
        //check if file exists or hasend dopened fsr
        if (input_file.is_open() == false)
        {
            std::cerr << "input_file not found" << std::endl;
            return 1;
        }

        //little indian
        //no overflow detection :(
        bool overflow = false;
        for (unsigned int i = 0; i < c_buff_size; i++)
        {
            unsigned char c = (unsigned char) input_file.get();
            c++;
            input_file.seekp((input_file.tellp() - static_cast<std::streampos>(1)));
            input_file.put(c);
            input_file.seekp(input_file.tellp());
            if(c != (unsigned char) 0){
                break;
            }
            if(input_file.eof()){
                overflow = true;
                break;
            }

        }
        input_file.close();

        if(overflow){
            std::cerr << "Overflow Detected" << std::endl;
        }
    }


    if(output){
        f_buffer buffer[c_buff_size];
        std::ifstream read_file;

        read_file.open(input_path, std::ios::binary);
        read_file.read((char*) buffer, sizeof(buffer));
        read_file.close();
        
        //printBits(sizeof(buffer), buffer);
        unsigned int out = 0;
        for (size_t i = 0; i < c_buff_size; i++){
            out += buffer[i] << (8 * i);
        }
        std::cout << out << std::endl;

    }
    

    return 0;
}
