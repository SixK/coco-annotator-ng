wget -O /tmp/zim_vit_b_2043.tar https://github.com/naver-ai/ZIM/releases/download/ckpt-v1/zim_vit_b_2043.tar
tar xvf /tmp/zim_vit_b_2043.tar -C /tmp
mkdir -p ./zim
cp /tmp/zim_vit_b_2043/* ./zim/
