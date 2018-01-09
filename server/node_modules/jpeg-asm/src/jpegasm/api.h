#ifndef JPEG_API_API_H
#define JPEG_API_API_H

#ifdef __cplusplus
extern "C" {
#endif

int encode_jpeg(unsigned char* rgb_buffer, unsigned int rgb_width, unsigned int rgb_height, int quality, unsigned char** out_buffer, unsigned int* out_size, char** out_msg);
int decode_jpeg(unsigned char* jpeg_buffer, unsigned int jpeg_size, unsigned char** out_buffer, unsigned int* out_width,  unsigned int* out_height, char** out_msg);

#ifdef __cplusplus
}
#endif

#endif //JPEG_API_API_H
