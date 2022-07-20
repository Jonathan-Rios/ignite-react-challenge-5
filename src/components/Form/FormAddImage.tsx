import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from 'react-query';
import * as yup from 'yup';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  url: string;
  title: string;
  description: string;
}

interface FormAddImageData {
  closeModal: () => void;
}

export function FormAddImage({ closeModal }: FormAddImageData): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const createFormAddImageSchema = yup.object().shape({
    image: yup.mixed().required('Imagem obrigatória'),
    title: yup.string().required('Título obrigatório'),
    description: yup.string().required('Descrição obrigatório'),
  });

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (data: FormAddImageProps) => {
      await api.post('/api/images', {
        ...data,
        url: imageUrl,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm({
      resolver: yupResolver(createFormAddImageSchema),
    });

  const { errors } = formState;

  const onSubmit = async (data: FormAddImageProps): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Falha no envio',
          description: 'Ocorreu um erro ao realizar o upload da sua imagem.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

      toast({
        title: 'Sucesso',
        description: 'Envio realizado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await mutation.mutateAsync({
        url: imageUrl,
        title: data.title,
        description: data.description,
      });
    } catch {
      toast({
        title: 'Falha no envio',
        description: 'Ocorreu um erro ao realizar o upload da sua imagem.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image')}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title')}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description')}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
