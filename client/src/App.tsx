import {
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertRoot,
  AlertTitle,
  Box,
  Button,
  Container,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  FieldLabel,
  FieldRoot,
  Heading,
  Image,
  Input,
  RadioGroupItem,
  RadioGroupItemHiddenInput,
  RadioGroupItemIndicator,
  RadioGroupItemText,
  RadioGroupLabel,
  RadioGroupRoot,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useCallback, useState } from 'react'

const API = '/api/support-image'

type Gender = 'male' | 'female'

type Banner =
  | { kind: 'warning'; title: string; description: string }
  | { kind: 'error'; title: string; description: string }

export default function App() {
  const [nameModalOpen, setNameModalOpen] = useState(true)
  const [draftName, setDraftName] = useState('')
  const [draftGender, setDraftGender] = useState<Gender>('male')
  const [confirmedName, setConfirmedName] = useState('')
  const [confirmedGender, setConfirmedGender] = useState<Gender>('male')
  const [modalHint, setModalHint] = useState<string | null>(null)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<Banner | null>(null)

  const revokePrevious = useCallback(() => {
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const submitNameFromModal = () => {
    const trimmed = draftName.trim()
    if (!trimmed) {
      setModalHint('Введите имя или короткое обращение.')
      return
    }
    setModalHint(null)
    setConfirmedName(trimmed)
    setConfirmedGender(draftGender)
    setNameModalOpen(false)
  }

  const generate = async () => {
    const trimmed = confirmedName.trim()
    if (!trimmed) return

    setBanner(null)
    revokePrevious()
    setLoading(true)
    try {
      const seed = Math.floor(Math.random() * 1_000_000_000)
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          seed,
          gender: confirmedGender,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(
          typeof err?.error === 'string' ? err.error : `Ошибка ${res.status}`,
        )
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setImageUrl(url)
    } catch (e) {
      setBanner({
        kind: 'error',
        title: 'Не получилось создать картинку',
        description:
          e instanceof Error ? e.message : 'Проверьте, что сервер запущен.',
      })
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `podderzhka-${confirmedName.trim().replace(/\s+/g, '-') || 'card'}.png`
    a.click()
  }

  return (
    <Box
      minH="100vh"
      color="fg"
      bgGradient="to-br"
      gradientFrom="gray.800"
      gradientVia="purple.900"
      gradientTo="gray.700"
      py={{ base: 10, md: 16 }}
      px={4}
    >
      <DialogRoot
        open={nameModalOpen}
        onOpenChange={(e) => {
          if (e.open) setNameModalOpen(true)
        }}
        closeOnInteractOutside={false}
        closeOnEscape={false}
        modal
        preventScroll
        role="alertdialog"
      >
        <DialogBackdrop bg="blackAlpha.500" backdropFilter="blur(3px)" />
        <DialogPositioner display="flex" alignItems="center" justifyContent="center" p={4}>
          <DialogContent
            maxW="md"
            borderRadius="2xl"
            mx="auto"
            bg="gray.800"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            boxShadow="2xl"
          >
            <DialogHeader>
              <DialogTitle textAlign="center" fontSize="xl" color="fg">
                Как к вам обращаться?
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={4}>
                <Text color="fg.muted" textAlign="center" fontSize="sm">
                  Имя и пол нужны для подписи и формулировок на открытке. Выбор доступен
                  при каждой перезагрузке страницы.
                </Text>
                <FieldRoot>
                  <FieldLabel fontWeight="600" color="fg">
                    Ваше имя
                  </FieldLabel>
                  <Input
                    size="lg"
                    placeholder="Например, Денис"
                    value={draftName}
                    onChange={(e) => {
                      setDraftName(e.target.value)
                      setModalHint(null)
                    }}
                    maxLength={80}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitNameFromModal()
                    }}
                  />
                </FieldRoot>

                <RadioGroupRoot
                  value={draftGender}
                  onValueChange={(d) => setDraftGender((d.value as Gender) || 'male')}
                  colorPalette="purple"
                >
                  <RadioGroupLabel fontWeight="600" color="fg" mb={5}>
                    Пол
                  </RadioGroupLabel>
                  <Stack gap={3}>
                    <RadioGroupItem value="male">
                      <RadioGroupItemHiddenInput />
                      <RadioGroupItemIndicator />
                      <RadioGroupItemText>Мужской</RadioGroupItemText>
                    </RadioGroupItem>
                    <RadioGroupItem value="female">
                      <RadioGroupItemHiddenInput />
                      <RadioGroupItemIndicator />
                      <RadioGroupItemText>Женский</RadioGroupItemText>
                    </RadioGroupItem>
                  </Stack>
                </RadioGroupRoot>
                {modalHint && (
                  <Text color="fg.error" fontSize="sm" textAlign="center">
                    {modalHint}
                  </Text>
                )}
              </Stack>
            </DialogBody>
            <DialogFooter justifyContent="center" gap={3}>
              <Button colorPalette="purple" size="lg" onClick={submitNameFromModal}>
                Продолжить
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      <Container maxW="container.md">
        <Stack gap={8} align="stretch">
          <Stack gap={3} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              fontWeight="extrabold"
              color="white"
              letterSpacing="-0.02em"
              textShadow="0 1px 2px rgba(0,0,0,0.5), 0 0 20px rgba(216, 180, 254, 0.65)"
            >
              Поддержатор
            </Heading>
            <Text color="fg.muted" fontSize="lg">
              Сгенерируйте открытку с тёплыми словами поддержки — обращение на открытке
              для {confirmedName ? `«${confirmedName}»` : 'вас'}.
            </Text>
          </Stack>

          <Box
            bg="gray.800"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            boxShadow="2xl"
            p={{ base: 6, md: 8 }}
          >
            <Stack gap={6}>
              {banner && (
                <AlertRoot status={banner.kind === 'warning' ? 'warning' : 'error'}>
                  <AlertIndicator />
                  <AlertContent>
                    <AlertTitle>{banner.title}</AlertTitle>
                    <AlertDescription>{banner.description}</AlertDescription>
                  </AlertContent>
                </AlertRoot>
              )}

              <Button
                colorPalette="purple"
                size="lg"
                onClick={() => void generate()}
                loading={loading}
                loadingText="Рисуем открытку…"
                disabled={!confirmedName.trim()}
              >
                Сгенерировать картинку
              </Button>

              {imageUrl && (
                <Stack gap={4} align="center">
                  <Image
                    src={imageUrl}
                    alt="Открытка с поддержкой"
                    borderRadius="xl"
                    maxW="100%"
                    boxShadow="lg"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                  />
                  <Button
                    variant="outline"
                    colorPalette="purple"
                    onClick={download}
                  >
                    Скачать PNG
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
